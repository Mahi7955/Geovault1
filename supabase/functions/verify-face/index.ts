import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 3;
const MATCH_THRESHOLD = 0.5;

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretId, descriptor } = await req.json();

    if (!secretId || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: secret, error } = await supabase
      .from("secrets")
      .select(
        "face_descriptor, face_verification_enabled, face_attempts, encrypted_content, file_url, remaining_views, is_active"
      )
      .eq("id", secretId)
      .maybeSingle();

    if (error || !secret) {
      return new Response(
        JSON.stringify({ error: "Secret not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!secret.is_active) {
      return new Response(
        JSON.stringify({ error: "Secret is no longer available" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!secret.face_verification_enabled || !secret.face_descriptor) {
      return new Response(
        JSON.stringify({ error: "Face verification not enabled for this secret" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const attempts = secret.face_attempts || 0;
    if (attempts >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({
          allowed: false,
          locked: true,
          attemptsRemaining: 0,
          message: "Maximum face verification attempts exceeded. Access locked.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stored = secret.face_descriptor as number[];
    const distance = euclideanDistance(stored, descriptor);
    const matched = distance < MATCH_THRESHOLD;

    console.log(`Face distance: ${distance.toFixed(4)} (threshold ${MATCH_THRESHOLD})`);

    if (!matched) {
      const newAttempts = attempts + 1;
      await supabase
        .from("secrets")
        .update({ face_attempts: newAttempts })
        .eq("id", secretId);

      const remaining = MAX_ATTEMPTS - newAttempts;
      return new Response(
        JSON.stringify({
          allowed: false,
          locked: remaining <= 0,
          attemptsRemaining: Math.max(0, remaining),
          message:
            remaining > 0
              ? `Face does not match. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Maximum face verification attempts exceeded. Access locked.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Match - decrement views and return content
    const newRemaining = secret.remaining_views - 1;
    await supabase
      .from("secrets")
      .update({
        remaining_views: newRemaining,
        is_active: newRemaining > 0,
        face_attempts: 0,
      })
      .eq("id", secretId);

    return new Response(
      JSON.stringify({
        allowed: true,
        encryptedContent: secret.encrypted_content,
        fileUrl: secret.file_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("verify-face error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
