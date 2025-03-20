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

    // Get the current user to check if they're an admin
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

    // Check if the current user is an admin
    const { data: currentUserRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role_name")
      .eq("user_id", user.id)
      .single();

    if (
      roleError ||
      !currentUserRole ||
      currentUserRole.role_name !== "admin"
    ) {
      throw new Error("Unauthorized: Only admins can manage user roles");
    }

    // Get request body
    const { targetUserEmail, newRole } = await req.json();

    if (!targetUserEmail || !newRole) {
      throw new Error(
        "Missing required parameters: targetUserEmail and newRole",
      );
    }

    if (newRole !== "user" && newRole !== "admin") {
      throw new Error("Invalid role: must be 'user' or 'admin'");
    }

    // Call the database function to set the user role
    const { data: result, error: fnError } = await supabaseClient.rpc(
      "set_user_role",
      {
        user_email: targetUserEmail,
        new_role: newRole,
      },
    );

    if (fnError) {
      throw new Error(`Failed to update user role: ${fnError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${targetUserEmail} role updated to ${newRole}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error managing user role:", error);
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
