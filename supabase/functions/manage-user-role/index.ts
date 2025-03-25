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

    console.log(`Looking up user with email: ${targetUserEmail}`);

    // First, get the user ID from the email
    const { data: userData, error: userLookupError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("email", targetUserEmail)
      .single();

    if (userLookupError) {
      console.error("Error finding user:", userLookupError);
      throw new Error(`Error finding user: ${userLookupError.message}`);
    }

    if (!userData) {
      console.error(`User with email ${targetUserEmail} not found`);
      throw new Error(`User with email ${targetUserEmail} not found`);
    }

    console.log(`Found user ID: ${userData.id} for email: ${targetUserEmail}`);

    // Check if user already has a role
    const { data: existingRole, error: existingRoleError } =
      await supabaseClient
        .from("user_roles")
        .select("*")
        .eq("user_id", userData.id)
        .single();

    let result;
    if (existingRoleError && existingRoleError.code !== "PGRST116") {
      // Error other than "no rows returned"
      throw new Error(
        `Error checking existing role: ${existingRoleError.message}`,
      );
    }

    if (existingRole) {
      // Update existing role
      console.log(
        `Updating existing role for user ${userData.id} to ${newRole}`,
      );
      const { data: updateResult, error: updateError } = await supabaseClient
        .from("user_roles")
        .update({ role_name: newRole, updated_at: new Date().toISOString() })
        .eq("user_id", userData.id)
        .select();

      if (updateError) {
        throw new Error(`Failed to update user role: ${updateError.message}`);
      }
      result = updateResult;
    } else {
      // Create new role
      console.log(`Creating new role for user ${userData.id} as ${newRole}`);
      const { data: insertResult, error: insertError } = await supabaseClient
        .from("user_roles")
        .insert({
          user_id: userData.id,
          role_name: newRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (insertError) {
        throw new Error(`Failed to create user role: ${insertError.message}`);
      }
      result = insertResult;
    }

    console.log(`Role operation successful:`, result);

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${targetUserEmail} role updated to ${newRole}`,
        data: result,
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
        details: error.stack || "No stack trace available",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
