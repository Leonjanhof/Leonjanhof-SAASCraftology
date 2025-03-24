import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { product_id } = await req.json();

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

    console.log(`Checking if product exists with ID: ${product_id}`);

    // First, check if the product exists
    const { data: existingProduct, error: fetchError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (fetchError) {
      console.error("Error fetching product:", fetchError);

      // If the error is not a "not found" error, return it
      if (fetchError.code !== "PGRST116") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error fetching product",
            error: fetchError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If product not found, return appropriate message
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

    console.log(`Deleting product with ID: ${product_id}`);

    // Delete the product
    const { error: deleteError } = await supabaseClient
      .from("products")
      .delete()
      .eq("id", product_id);

    if (deleteError) {
      console.error("Error deleting product:", deleteError);

      // If the error is related to column not existing, try with a different column name
      if (
        deleteError.message &&
        deleteError.message.includes("column") &&
        deleteError.message.includes("does not exist")
      ) {
        console.log("Trying alternative column name for deletion");
        const { error: altDeleteError } = await supabaseClient
          .from("products")
          .delete()
          .eq("product_id", product_id);

        if (!altDeleteError) {
          console.log("Successfully deleted using alternative column name");
          deleteError = null; // Clear the error since we succeeded with alternative approach
        } else {
          console.error("Alternative deletion also failed:", altDeleteError);
        }
      }
    }

    if (deleteError) {
      console.error("Error deleting product:", deleteError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to delete product",
          error: deleteError.message,
          details: deleteError.details,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log the deletion activity
    try {
      await supabaseClient.functions.invoke("supabase-functions-log-activity", {
        body: {
          event_type: "product_deleted",
          details: `Product ${existingProduct.name} was deleted`,
          metadata: {
            product_id: product_id,
            product_name: existingProduct.name,
          },
        },
      });
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Continue execution even if logging fails
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
