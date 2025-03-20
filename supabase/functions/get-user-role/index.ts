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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Get the current user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid token or user not found");
    }

    // Get user role and permissions
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role_name")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      throw new Error(`Error fetching user role: ${roleError.message}`);
    }

    const { data: permissions, error: permissionsError } = await supabaseClient
      .from("role_permissions")
      .select("permission")
      .eq("role_name", userRole?.role_name || "user");

    if (permissionsError) {
      throw new Error(
        `Error fetching permissions: ${permissionsError.message}`,
      );
    }

    return new Response(
      JSON.stringify({
        role: userRole?.role_name || "user",
        permissions: permissions?.map((p) => p.permission) || [],
        isAdmin: userRole?.role_name === "admin",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error getting user role:", error);
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
