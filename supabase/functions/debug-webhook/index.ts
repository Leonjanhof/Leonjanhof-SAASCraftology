import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get webhook events
    const { data: webhookEvents, error: webhookError } = await supabaseClient
      .from("webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (webhookError) {
      throw new Error(
        `Failed to fetch webhook events: ${webhookError.message}`,
      );
    }

    // Get subscriptions
    const { data: subscriptions, error: subscriptionsError } =
      await supabaseClient
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    if (subscriptionsError) {
      throw new Error(
        `Failed to fetch subscriptions: ${subscriptionsError.message}`,
      );
    }

    // Get licenses
    const { data: licenses, error: licensesError } = await supabaseClient
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (licensesError) {
      throw new Error(`Failed to fetch licenses: ${licensesError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        webhookEvents,
        subscriptions,
        licenses,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in debug-webhook function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
