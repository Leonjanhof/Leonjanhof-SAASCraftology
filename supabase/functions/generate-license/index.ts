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
    const { userId, productName, expiresAt } = await req.json();

    // Validate required fields
    if (!userId || !productName) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: userId and productName are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({
          error: "User not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract product code from product name
    let productCode = "";
    if (productName && productName.length > 0) {
      productCode = productName
        .replace(/\s+/g, "")
        .substring(0, 3)
        .toUpperCase();
    } else {
      // Fallback if product name is empty
      productCode = "UNK"; // Unknown product
    }

    // Ensure product code is exactly 3 characters
    if (productCode.length < 3) {
      productCode = productCode.padEnd(3, "X");
    } else if (productCode.length > 3) {
      productCode = productCode.substring(0, 3);
    }

    // Generate a license key using the RPC function
    const { data: licenseKeyData, error: licenseKeyError } =
      await supabaseClient.rpc("generate_license_key", {
        product_code: productCode,
      });

    if (licenseKeyError) {
      return new Response(
        JSON.stringify({
          error: `Failed to generate license key: ${licenseKeyError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!licenseKeyData) {
      return new Response(
        JSON.stringify({
          error: "License key generation failed - no key returned",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const licenseKey = licenseKeyData;

    // Create the license in the database
    const timestamp = new Date().toISOString();
    const licenseData = {
      user_id: userId,
      product_name: productName,
      license_key: licenseKey,
      active: true,
      created_at: timestamp,
      updated_at: timestamp,
      expires_at: expiresAt || null,
    };

    const { data: license, error: insertError } = await supabaseClient
      .from("licenses")
      .insert(licenseData)
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: `Failed to create license: ${insertError.message}`,
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
          user_id: userId,
          event_type: "license_generated",
          details: `License generated for product ${productName}`,
          metadata: {
            license_id: license.id,
            product_name: productName,
            expires_at: expiresAt || null,
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
        license,
        message: "License generated successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in generate-license function:", error);
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
