import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { code } = await req.json();

    if (!code) {
      throw new Error("No code provided");
    }

    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
    const clientSecret = Deno.env.get(
      "MICROSOFT_PROVIDER_AUTHENTICATION_SECRET",
    );

    if (!clientId || !clientSecret) {
      throw new Error("Microsoft client credentials not configured");
    }

    console.log("Exchanging code for tokens");

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/consumers/oauth20_token.srf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: "https://craftology.app/auth/microsoft",
          grant_type: "authorization_code",
        }),
      },
    );

    // Log the response for debugging
    const responseText = await tokenResponse.text();
    console.log("Token response status:", tokenResponse.status);
    console.log("Token response:", responseText);

    // Parse the response as JSON
    const tokens = responseText ? JSON.parse(responseText) : null;

    if (!tokens || tokens.error) {
      throw new Error(
        `Token error: ${tokens?.error_description || tokens?.error || "No tokens received"}`,
      );
    }

    // Get Microsoft Graph profile
    console.log("Getting Microsoft Graph profile");
    const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const profile = await profileResponse.json();
    console.log("Microsoft Graph profile received");

    if (profile.error) {
      throw new Error(`Profile error: ${profile.error.message}`);
    }

    // Get Xbox Live token
    console.log("Getting Xbox Live token");
    const xblResponse = await fetch(
      "https://user.auth.xboxlive.com/user/authenticate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Properties: {
            AuthMethod: "RPS",
            SiteName: "user.auth.xboxlive.com",
            RpsTicket: `d=${tokens.access_token}`,
          },
          RelyingParty: "http://auth.xboxlive.com",
          TokenType: "JWT",
        }),
      },
    );

    const xblData = await xblResponse.json();
    console.log("Xbox Live token received");

    if (xblData.error) {
      throw new Error(`Xbox Live error: ${xblData.error}`);
    }

    return new Response(
      JSON.stringify({
        id: profile.id,
        username: profile.displayName || profile.userPrincipalName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        xboxLiveToken: xblData.Token,
        userHash: xblData.DisplayClaims?.xui?.[0]?.uhs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Microsoft auth error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
