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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Parse request body
    const { page = 1, pageSize = 10, searchQuery } = await req.json();

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabaseClient
      .from("licenses")
      .select("*, users!licenses_user_id_fkey(email)", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(
        `license_key.ilike.%${searchQuery}%,product_name.ilike.%${searchQuery}%,users.email.ilike.%${searchQuery}%`,
      );
    }

    // Apply pagination
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching licenses:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Transform the data to include user_email
    const transformedData = data.map((license) => ({
      ...license,
      user_email: license.users?.email || null,
      users: undefined, // Remove the nested users object
    }));

    return new Response(
      JSON.stringify({
        data: transformedData,
        totalCount: count || 0,
        page,
        pageSize,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in get-licenses function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
