import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Inline token verification functions to avoid module import issues

/**
 * Verifies a license token
 * @param token Base64 encoded token string
 * @returns Decoded token data if valid, null if invalid
 */
function verifyToken(token: string): TokenData | null {
  try {
    // Decode the base64 token
    const decodedToken = JSON.parse(atob(token));

    // Check if token has expired
    if (!decodedToken.exp || decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log("Token has expired");
      return null;
    }

    // Validate token structure
    if (!decodedToken.license_id || !decodedToken.product_name) {
      console.log("Token is missing required fields");
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Token data structure
 */
interface TokenData {
  license_id: string;
  product_name: string;
  user_id: string;
  exp: number;
}

/**
 * Extracts token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null if invalid
 */
function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Middleware-style function to verify a token from request headers
 * @param req Request object
 * @returns TokenData if valid, null if invalid
 */
async function verifyRequestToken(req: Request): Promise<TokenData | null> {
  const authHeader = req.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the token from the request
    const tokenData = await verifyRequestToken(req);

    if (!tokenData) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Invalid or expired token. Please verify your license again.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

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

    // Get the request body
    const requestBody = await req.json().catch(() => ({}));

    // Example: Get license details for the verified token
    const { data: license, error: licenseError } = await supabaseClient
      .from("licenses")
      .select("*")
      .eq("id", tokenData.license_id)
      .single();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "License not found or inactive",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Process the protected endpoint logic here
    // This is just an example response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Protected endpoint accessed successfully",
        data: {
          product_name: tokenData.product_name,
          user_id: tokenData.user_id,
          // Include any other data you want to return
          // Don't include sensitive information
        },
        request_data: requestBody,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in protected endpoint:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
