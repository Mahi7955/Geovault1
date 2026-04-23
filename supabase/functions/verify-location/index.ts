import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Geocode coordinates to get full address
async function geocodeLocation(lat: number, lng: number, apiKey: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results[0]) {
      const result = data.results[0];
      const addressComponents = result.address_components;

      return {
        formattedAddress: result.formatted_address,
        country: addressComponents.find((c: any) => c.types.includes('country'))?.long_name || '',
        state: addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || '',
        district: addressComponents.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || '',
        locality: addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || '',
        sublocality: addressComponents.find((c: any) => c.types.includes('sublocality'))?.long_name || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { secretId, viewerLat, viewerLng } = await req.json();
    
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get secret's allowed location and whether another verification step is required.
    const { data: secret, error: secretError } = await supabase
      .from('secrets')
      .select('geo_restrictions, encrypted_content, remaining_views, file_url, face_verification_enabled')
      .eq('id', secretId)
      .eq('is_active', true)
      .maybeSingle();

    if (secretError || !secret) {
      return new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoRestrictions = secret.geo_restrictions as any;
    if (!geoRestrictions || !geoRestrictions.latitude || !geoRestrictions.longitude) {
      return new Response(
        JSON.stringify({ error: 'No location restrictions set' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const distance = calculateDistance(
      geoRestrictions.latitude,
      geoRestrictions.longitude,
      viewerLat,
      viewerLng
    );

    console.log(`Distance: ${distance.toFixed(2)}m`);

    if (distance > 100) {
      const viewerAddress = await geocodeLocation(viewerLat, viewerLng, GOOGLE_MAPS_API_KEY);

      return new Response(
        JSON.stringify({
          allowed: false,
          distance: Math.round(distance),
          viewerLocation: viewerAddress?.formattedAddress || 'Unknown location',
          message: `Access Denied: You are ${Math.round(distance)} meters away from the allowed area. You must be within 100 meters.`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const viewerAddress = await geocodeLocation(viewerLat, viewerLng, GOOGLE_MAPS_API_KEY);
    const faceRequired = !!secret.face_verification_enabled;

    // Important: if face verification is required, do not consume a view yet.
    // The view should only be decremented after face verification succeeds.
    if (faceRequired) {
      return new Response(
        JSON.stringify({
          allowed: true,
          distance: Math.round(distance),
          viewerLocation: viewerAddress,
          faceRequired: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newRemainingViews = secret.remaining_views - 1;
    const { error: updateError } = await supabase
      .from('secrets')
      .update({
        remaining_views: newRemainingViews,
        is_active: newRemainingViews > 0,
      })
      .eq('id', secretId);

    if (updateError) {
      console.error('Error updating views:', updateError);
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        distance: Math.round(distance),
        encryptedContent: secret.encrypted_content,
        fileUrl: secret.file_url,
        viewerLocation: viewerAddress,
        faceRequired: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
