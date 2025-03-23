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
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Get the user ID from the request body
    const { userId } = await req.json();

    if (userId) {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabaseClient
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking user role: ${checkError.message}`);
      }

      // If no role exists, create one
      if (!existingRole) {
        // Try to use the RPC function first
        const { error: rpcError } = await supabaseClient.rpc("set_user_role", {
          user_email: "", // We don't have the email here, but the function will use user_id
          new_role: "user",
        });

        if (rpcError) {
          console.log(
            `RPC error, falling back to direct insert: ${rpcError.message}`,
          );
          // Fallback to direct insert
          const { error: insertError } = await supabaseClient
            .from("user_roles")
            .insert({
              user_id: userId,
              role_name: "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select();

          if (insertError) {
            throw new Error(`Error creating user role: ${insertError.message}`);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `User role created for user ID: ${userId}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `User role already exists for user ID: ${userId}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // If no userId provided, run the function to create missing roles for all users
    const { error: functionError } = await supabaseClient.rpc(
      "create_missing_user_roles",
    );

    if (functionError) {
      throw new Error(`Error running function: ${functionError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Created missing user roles for all users",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fixing user roles:", error);
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
