import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretId } = await req.json();
    if (!secretId) {
      return new Response(
        JSON.stringify({ error: "secretId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: secret, error } = await supabase
      .from("secrets")
      .select("id, title, is_active, expire_at, remaining_views, face_verification_enabled, geo_restrictions")
      .eq("id", secretId)
      .maybeSingle();

    if (error || !secret) {
      return new Response(
        JSON.stringify({ found: false, error: "Secret not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expired = new Date(secret.expire_at).getTime() < Date.now();
    const exhausted = !secret.is_active || secret.remaining_views <= 0;

    return new Response(
      JSON.stringify({
        found: true,
        id: secret.id,
        title: secret.title,
        available: !expired && !exhausted,
        expired,
        exhausted,
        face_verification_enabled: !!secret.face_verification_enabled,
        location_required: !!secret.geo_restrictions,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
