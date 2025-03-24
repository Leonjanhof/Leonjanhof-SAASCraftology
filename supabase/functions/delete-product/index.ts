import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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
    let product_id;
    try {
      const body = await req.json();
      product_id = body.product_id;
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate required fields
    if (!product_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required field: product_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Attempting to delete product with ID: ${product_id}`);

    // Check if the product exists using product_id (the only column available)
    const { data: existingProduct, error: fetchError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("product_id", product_id)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Product not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Delete the product using product_id
    const { error: deleteError } = await supabaseClient
      .from("products")
      .delete()
      .eq("product_id", product_id);

    if (deleteError) {
      console.error("Error deleting product:", deleteError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to delete product",
          error: deleteError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Product deleted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in delete-product function:", error);
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
