import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Parse request body
    const { licenseId, expiresAt } = await req.json();

    // Validate required fields
    if (!licenseId || !expiresAt) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: licenseId and expiresAt are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if license exists
    const { data: licenseData, error: licenseError } = await supabaseClient
      .from("licenses")
      .select("*")
      .eq("id", licenseId)
      .single();

    if (licenseError || !licenseData) {
      return new Response(
        JSON.stringify({
          error: "License not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    if (expiryDate <= now) {
      return new Response(
        JSON.stringify({
          error: "Expiry date must be in the future",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update the license with the new expiry date
    const { data: updatedLicense, error: updateError } = await supabaseClient
      .from("licenses")
      .update({
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
        // If license was inactive, activate it
        active: true,
      })
      .eq("id", licenseId)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({
          error: `Failed to update license: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log the activity
    await supabaseClient.functions
      .invoke("supabase-functions-log-activity", {
        body: {
          user_id: licenseData.user_id,
          event_type: "license_extended",
          details: `License for ${licenseData.product_name} extended to ${new Date(
            expiresAt,
          ).toLocaleDateString()}`,
          metadata: {
            license_id: licenseId,
            product_name: licenseData.product_name,
            previous_expiry: licenseData.expires_at,
            new_expiry: expiresAt,
          },
        },
      })
      .catch((err) => {
        console.error("Failed to log activity:", err);
        // Continue execution even if logging fails
      });

    return new Response(
      JSON.stringify({
        success: true,
        license: updatedLicense,
        message: "License extended successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in extend-license function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
