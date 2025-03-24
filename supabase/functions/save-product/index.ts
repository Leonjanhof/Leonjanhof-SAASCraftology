import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProductData {
  id?: string;
  product_id?: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
  created_at?: string;
  updated_at?: string;
}

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
    const requestData = await req.json();
    const { product, isUpdate } = requestData;

    // Validate required fields
    if (
      !product ||
      !product.name ||
      !product.description ||
      product.price === undefined ||
      !product.price_id
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "Name, description, price, and price_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare product data
    const productData: ProductData = {
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      price_id: product.price_id,
      features: Array.isArray(product.features) ? product.features : [],
      is_subscription: Boolean(product.is_subscription),
      is_popular: Boolean(product.is_popular),
      icon_name: product.icon_name || "Package",
      updated_at: new Date().toISOString(),
    };

    // If product_id is provided in the request, use it
    if (product.product_id) {
      productData.product_id = product.product_id;
    }

    let result;

    if (isUpdate && (product.product_id || product.id)) {
      // Update existing product using product_id if available, otherwise fall back to id
      const idField = product.product_id ? "product_id" : "id";
      const idValue = product.product_id || product.id;

      console.log(`Updating product with ${idField}=${idValue}`, productData);

      // Make sure the ID is included in the productData for the update
      if (idField === "id") {
        productData.id = idValue;
      } else {
        productData.product_id = idValue;
      }

      result = await supabaseClient
        .from("products")
        .update(productData)
        .eq(idField, idValue)
        .select();
    } else {
      // Create new product
      productData.created_at = new Date().toISOString();
      result = await supabaseClient
        .from("products")
        .insert(productData)
        .select();
    }

    if (result.error) {
      console.error("Database operation failed:", result.error);
      return new Response(
        JSON.stringify({
          error: result.error.message,
          details: result.error.details,
          code: result.error.code,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        message: isUpdate
          ? "Product updated successfully"
          : "Product created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in save-product function:", error);
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
