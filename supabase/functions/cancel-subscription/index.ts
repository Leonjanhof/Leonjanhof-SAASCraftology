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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    console.log(`Attempting to cancel subscription: ${subscription_id}`);

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

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError);
      throw new Error(`Subscription not found: ${subscriptionError.message}`);
    }

    if (!subscription) {
      console.error("Subscription not found in database");
      throw new Error("Subscription not found in database");
    }

    try {
      // Cancel the subscription at period end
      console.log(`Canceling subscription in Stripe: ${subscription_id}`);
      const updatedSubscription = await stripe.subscriptions.update(
        subscription_id,
        { cancel_at_period_end: true },
      );

      console.log(
        `Stripe subscription updated: ${updatedSubscription.id}, status: ${updatedSubscription.status}`,
      );

      // Update the subscription in the database
      const { data: updateResult, error: updateError } = await supabaseClient
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_id", subscription_id);

      if (updateError) {
        console.error("Error updating subscription in database:", updateError);
      } else {
        console.log("Subscription updated in database successfully");
      }

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
    } catch (stripeError) {
      console.error("Error canceling subscription in Stripe:", stripeError);

      // If Stripe error is because subscription doesn't exist, mark it as canceled in our database
      if (stripeError.code === "resource_missing") {
        console.log(
          "Subscription not found in Stripe, marking as canceled in database",
        );

        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({
            cancel_at_period_end: true,
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_id", subscription_id);

        if (updateError) {
          console.error(
            "Error marking subscription as canceled in database:",
            updateError,
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription marked as canceled in database",
            data: {
              subscription_id,
              cancel_at_period_end: true,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      throw stripeError;
    }
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred",
        error: error.code || error.type || "unknown_error",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
