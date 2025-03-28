import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-customer-email",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { price_id, user_id, return_url } = await req.json();

    if (!price_id || !user_id || !return_url) {
      throw new Error("Missing required parameters");
    }

    // Map price IDs to product names
    const priceToProductMap: Record<string, string> = {
      price_1R1A9uGLqZ8YjU1vEkXXC79n: "Autovoter",
      price_1R1AE1GLqZ8YjU1vUrS3ZSXJ: "Factionsbot 1.18.2",
      price_1R1AETGLqZ8YjU1vkuXGLxKY: "EMC captcha solver",
    };

    const productName = priceToProductMap[price_id] || "";

    // Get product details to check if it's a subscription or one-time purchase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Fetch product details from the database
    const { data: productData, error: productError } = await supabaseClient
      .from("products")
      .select("is_subscription")
      .eq("price_id", price_id)
      .single();

    if (productError) {
      console.error("Error fetching product details:", productError);
    }

    // Determine if this is a subscription or one-time purchase
    const isSubscription = productData?.is_subscription ?? true; // Default to subscription if not found

    // Create Stripe checkout session with the appropriate mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${return_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url}?canceled=true`,
      customer_email: req.headers.get("X-Customer-Email"),
      metadata: {
        user_id,
        product_name: productName,
        is_subscription: isSubscription.toString(),
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
