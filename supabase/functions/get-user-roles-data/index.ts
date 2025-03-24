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

    // Create a Supabase client with the anon key first to verify the JWT token
    try {
      console.log("Creating anon client to verify token");
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );

      const token = authHeader.replace("Bearer ", "");
      console.log("Verifying token...");
      const {
        data: { user },
        error: userError,
      } = await anonClient.auth.getUser(token);

      if (userError) {
        console.error("User authentication error:", userError);
        throw new Error(`Unauthorized: Invalid token - ${userError.message}`);
      }

      if (!user) {
        console.error("No user found with token");
        throw new Error("Unauthorized: No user found");
      }

      console.log("Authenticated user ID:", user.id);

      // Now create a client with the service role key for admin operations
      console.log("Creating service role client for admin operations");
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );

      // Check if the user is an admin using the RPC function
      console.log("Checking if user is admin...");
      try {
        const { data: isAdmin, error: adminCheckError } =
          await supabaseClient.rpc("is_admin", { user_id: user.id });

        console.log(
          "Admin check result:",
          isAdmin,
          "Error:",
          adminCheckError ? adminCheckError.message : "none",
        );

        if (adminCheckError) {
          console.error("Admin check error:", adminCheckError);
          throw new Error(
            `Error checking admin status: ${adminCheckError.message}`,
          );
        }

        if (!isAdmin) {
          console.log("User is not an admin:", user.id);
          throw new Error("Unauthorized: Admin access required");
        }
      } catch (adminError) {
        console.error("Error in admin check:", adminError);
        throw adminError;
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
            users!user_id(full_name, email)
          `,
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }

        console.log(`Found ${userRoles ? userRoles.length : 0} user roles`);

        // Format the response data
        const formattedUserRoles = userRoles
          ? userRoles.map((role) => ({
              id: role.id,
              user_id: role.user_id,
              email: role.users?.email || role.user_id,
              full_name: role.users?.full_name || "N/A",
              role_name: role.role_name || "user",
              created_at: role.created_at,
              updated_at: role.updated_at,
            }))
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
    } catch (authError) {
      console.error("Authentication error:", authError);
      throw authError;
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
