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
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get subscription ID from request body
    const { subscription_id } = await req.json();

    if (!subscription_id) {
      throw new Error("Subscription ID is required");
    }

    // Validate subscription_id format
    if (
      typeof subscription_id !== "string" ||
      !subscription_id.startsWith("sub_")
    ) {
      throw new Error("Invalid subscription ID format");
    }

    // Get the subscription details
    const { data: subscription, error: subscriptionError } =
      await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("stripe_id", subscription_id)
        .single();

    if (subscriptionError || !subscription) {
      throw new Error("Subscription not found");
    }

    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(
      subscription_id,
      { cancel_at_period_end: true },
    );

    // Update the subscription in the database
    await supabaseClient
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_id", subscription_id);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Subscription will be cancelled at the end of the billing period",
        data: {
          current_period_end: updatedSubscription.current_period_end,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
