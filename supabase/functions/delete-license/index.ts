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
    const { licenseId } = await req.json();

    // Validate required fields
    if (!licenseId) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: licenseId is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if license exists and get its details for logging
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

    // Delete the license
    const { error: deleteError } = await supabaseClient
      .from("licenses")
      .delete()
      .eq("id", licenseId);

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error: `Failed to delete license: ${deleteError.message}`,
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
          event_type: "license_deleted",
          details: `License for ${licenseData.product_name} deleted`,
          metadata: {
            license_id: licenseId,
            product_name: licenseData.product_name,
            license_key: licenseData.license_key,
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
        message: "License deleted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in delete-license function:", error);
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
