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
    console.log("Edge function called: get-user-roles-data");

    // Get the request body if any
    let requestData = {};
    try {
      if (req.body) {
        requestData = await req.json();
        console.log("Request data:", JSON.stringify(requestData));
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      // Continue with empty request data
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

    // Get search parameters if any
    const searchQuery = requestData.searchQuery || "";
    const page = requestData.page || 1;
    const pageSize = requestData.pageSize || 10;
    const offset = (page - 1) * pageSize;

    console.log("Fetching user roles with pagination:", {
      page,
      pageSize,
      offset,
    });

    // Get user roles with user information
    try {
      console.log("Executing database query...");

      // First, get the total count
      const { count, error: countError } = await supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }

      console.log("Total user roles count:", count);

      // Then get the actual data
      const { data: userRolesData, error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .select(
          `
          id,
          user_id,
          role_name,
          created_at,
          updated_at
        `,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      console.log(
        `Found ${userRolesData ? userRolesData.length : 0} user roles`,
      );

      // Get user details for each user_id
      const userIds = userRolesData.map((role) => role.user_id);
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, full_name")
        .in("id", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      console.log(`Found ${usersData ? usersData.length : 0} users`);

      // Create a map of user_id to user details
      const userMap = {};
      if (usersData) {
        usersData.forEach((user) => {
          userMap[user.id] = user;
        });
      }

      // Format the response data
      const formattedUserRoles = userRolesData
        ? userRolesData.map((role) => {
            const user = userMap[role.user_id] || {};
            return {
              id: role.id,
              user_id: role.user_id,
              email: user.email || role.user_id,
              full_name: user.full_name || "N/A",
              role_name: role.role_name || "user",
              created_at: role.created_at,
              updated_at: role.updated_at,
            };
          })
        : [];

      console.log("Successfully formatted user roles data");

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
    } catch (queryError) {
      console.error("Database query error:", queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }
  } catch (error) {
    console.error("Error in get-user-roles-data function:", error);
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
