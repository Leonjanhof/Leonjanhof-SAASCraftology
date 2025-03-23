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
    // Create a Supabase client with the service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the request body if any
    let requestData = {};
    try {
      if (req.body) {
        requestData = await req.json();
      }
    } catch (e) {
      // If parsing fails, continue with empty request data
      console.error("Error parsing request body:", e);
    }

    // Get the authenticated user making the request
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
      throw new Error("Unauthorized");
    }

    // Check if the user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc(
      "is_admin",
      { user_id: user.id },
    );

    if (adminCheckError || !isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get search parameters if any
    const searchQuery = requestData.searchQuery || "";
    const page = requestData.page || 1;
    const pageSize = requestData.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // Get user roles with user information
    const {
      data: userRoles,
      error: rolesError,
      count,
    } = await supabaseClient
      .from("user_roles")
      .select(
        `
        id,
        user_id,
        role_name,
        created_at,
        updated_at,
        users:user_id (full_name, email)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (rolesError) {
      throw rolesError;
    }

    // Format the response data
    const formattedUserRoles = userRoles.map((role) => ({
      id: role.id,
      user_id: role.user_id,
      email: role.users?.email || role.user_id,
      full_name: role.users?.full_name || "N/A",
      role_name: role.role_name || "user",
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));

    return new Response(
      JSON.stringify({
        data: formattedUserRoles,
        totalCount: count || 0,
        page,
        pageSize,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in get-user-roles-data function:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status:
          error.message === "Unauthorized" ||
          error.message === "Unauthorized: Admin access required"
            ? 403
            : 500,
      },
    );
  }
});
