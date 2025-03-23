import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the request body
    const { event_type, type, data } = await req.json();

    // Validate required fields
    if (!event_type || !type) {
      return new Response(
        JSON.stringify({ error: "event_type and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert the activity log
    const { data: insertedData, error } = await supabaseClient
      .from("webhook_events")
      .insert({
        event_type,
        type,
        data,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error logging activity:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data: insertedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in log-activity function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
