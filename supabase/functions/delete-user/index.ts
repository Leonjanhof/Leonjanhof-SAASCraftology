import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Edge function called: delete-user");

    // Get the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data:", JSON.stringify(requestData));
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body");
    }

    // Validate request data
    if (!requestData.userId) {
      throw new Error("Missing required field: userId");
    }

    // Get the authenticated user making the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("Missing Authorization header");
    }

    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Extract token and get user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("User authentication error:", userError);
      throw new Error("Unauthorized: Invalid user token");
    }

    console.log("Authenticated user ID:", user.id);

    // Check if user is admin directly from the user_roles table
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role_name")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
      throw new Error("Error checking user role");
    }

    console.log("User role:", userRole?.role_name);

    if (!userRole || userRole.role_name !== "admin") {
      console.error("User is not an admin:", user.id);
      throw new Error("Unauthorized: Admin access required");
    }

    // Get the user to delete
    const userIdToDelete = requestData.userId;

    // Prevent deleting yourself
    if (userIdToDelete === user.id) {
      throw new Error("Cannot delete your own account");
    }

    // Start deleting user data
    console.log(`Deleting user data for user ID: ${userIdToDelete}`);

    // 1. Delete from licenses table
    const { error: licensesError } = await supabaseAdmin
      .from("licenses")
      .delete()
      .eq("user_id", userIdToDelete);

    if (licensesError) {
      console.error("Error deleting licenses:", licensesError);
      // Continue with other deletions even if this fails
    }

    // 2. Delete from subscriptions table
    const { error: subscriptionsError } = await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("user_id", userIdToDelete);

    if (subscriptionsError) {
      console.error("Error deleting subscriptions:", subscriptionsError);
      // Continue with other deletions even if this fails
    }

    // 3. Delete from reviews table
    const { error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("user_id", userIdToDelete);

    if (reviewsError) {
      console.error("Error deleting reviews:", reviewsError);
      // Continue with other deletions even if this fails
    }

    // 4. Delete from user_roles table
    const { error: userRolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userIdToDelete);

    if (userRolesError) {
      console.error("Error deleting user roles:", userRolesError);
      // Continue with other deletions even if this fails
    }

    // 5. Delete from users table
    const { error: usersError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userIdToDelete);

    if (usersError) {
      console.error("Error deleting user:", usersError);
      // Continue with auth deletion even if this fails
    }

    // 6. Delete from auth.users table (requires admin API)
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    // Log the activity
    try {
      await supabaseAdmin.from("webhook_events").insert({
        event_type: "user_deleted",
        type: "admin",
        data: {
          deleted_user_id: userIdToDelete,
          admin_user_id: user.id,
          description: `User ${userIdToDelete} was deleted by admin ${user.id}`,
        },
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Don't fail the operation if logging fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    console.error("Error stack:", error.stack);

    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        stack: error.stack || "No stack trace available",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status:
          error.message &&
          (error.message.includes("Unauthorized") ||
            error.message.includes("Invalid token") ||
            error.message.includes("Admin access required"))
            ? 403
            : 500,
      },
    );
  }
});
