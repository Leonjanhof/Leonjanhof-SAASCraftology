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
    const { license_id, user_id } = await req.json();

    // Validate required fields
    if (!license_id || !user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields: license_id and user_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if the license exists and belongs to the user
    const { data: licenseData, error: licenseError } = await supabaseClient
      .from("licenses")
      .select("*")
      .eq("id", license_id)
      .eq("user_id", user_id)
      .single();

    if (licenseError || !licenseData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "License not found or does not belong to the user",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if 7 days have passed since the last reset
    if (licenseData.last_reset_date) {
      const lastReset = new Date(licenseData.last_reset_date);
      const now = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      if (now.getTime() - lastReset.getTime() < oneWeek) {
        const daysLeft = Math.ceil(
          (oneWeek - (now.getTime() - lastReset.getTime())) /
            (24 * 60 * 60 * 1000),
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: `You can only reset your HWID once every 7 days. Please try again in ${daysLeft} day(s).`,
          }),
          {
            status: 429, // Too Many Requests
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Reset the HWID and update the last_reset_date
    const { data: updateData, error: updateError } = await supabaseClient
      .from("licenses")
      .update({
        hwid: null,
        last_reset_date: new Date().toISOString(),
      })
      .eq("id", license_id)
      .select();

    if (updateError) {
      console.error("Error updating license:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to reset HWID",
          error: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log the HWID reset activity
    await supabaseClient.functions
      .invoke("supabase-functions-log-activity", {
        body: {
          user_id: user_id,
          event_type: "hwid_reset",
          details: `HWID reset for license ${license_id}`,
          metadata: {
            license_id: license_id,
            product_name: licenseData.product_name,
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
        message: "HWID reset successfully",
        data: updateData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in reset-hwid function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
