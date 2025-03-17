import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { license_key, hwid } = await req.json();

    if (!license_key) {
      throw new Error("License key is required");
    }

    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Find the license in the database
    const { data: license, error: licenseError } = await supabaseClient
      .from("licenses")
      .select("*")
      .eq("license_key", license_key)
      .single();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Invalid license key",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if license is active
    if (!license.active) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "License is inactive",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Handle HWID verification
    if (hwid) {
      if (license.hwid && license.hwid !== hwid) {
        return new Response(
          JSON.stringify({
            valid: false,
            message:
              "Hardware ID mismatch. This license is already in use on another device.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If no HWID is set for this license yet, update it
      if (!license.hwid) {
        const { error: updateError } = await supabaseClient
          .from("licenses")
          .update({ hwid, updated_at: new Date().toISOString() })
          .eq("id", license.id);

        if (updateError) {
          console.error("Error updating HWID:", updateError);
          // Continue anyway, this is not a critical error
        }
      }
    }

    // Generate a token for the license
    // This token will be used for subsequent API calls
    const tokenData = {
      license_id: license.id,
      product_name: license.product_name,
      user_id: license.user_id,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    // Base64 encode the token
    const token = btoa(JSON.stringify(tokenData));

    return new Response(
      JSON.stringify({
        valid: true,
        message: "License verified successfully",
        license: {
          id: license.id,
          product_name: license.product_name,
          hwid: license.hwid,
          active: license.active,
        },
        token,
        expires_at: new Date(tokenData.exp * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error verifying license:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
