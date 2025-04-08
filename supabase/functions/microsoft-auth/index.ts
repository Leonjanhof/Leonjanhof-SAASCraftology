import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://login.live.com/oauth20_token.srf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId || "",
          client_secret:
            Deno.env.get("MICROSOFT_PROVIDER_AUTHENTICATION_SECRET") || "",
          code,
          redirect_uri: `${req.headers.get("origin")}/auth/microsoft`,

          grant_type: "authorization_code",
        }),
      },
    );

    const tokens = await tokenResponse.json();

    // Get Xbox Live token
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

    // Get XSTS token
    const xstsResponse = await fetch(
      "https://xsts.auth.xboxlive.com/xsts/authorize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Properties: {
            SandboxId: "RETAIL",
            UserTokens: [xblData.Token],
          },
          RelyingParty: "rp://api.minecraftservices.com/",
          TokenType: "JWT",
        }),
      },
    );

    const xstsData = await xstsResponse.json();

    // Get Minecraft token
    const mcResponse = await fetch(
      "https://api.minecraftservices.com/authentication/login_with_xbox",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          identityToken: `XBL3.0 x=${xstsData.DisplayClaims.xui[0].uhs};${xstsData.Token}`,
        }),
      },
    );

    const mcData = await mcResponse.json();

    // Get Minecraft profile
    const profileResponse = await fetch(
      "https://api.minecraftservices.com/minecraft/profile",
      {
        headers: {
          Authorization: `Bearer ${mcData.access_token}`,
        },
      },
    );

    const profile = await profileResponse.json();

    return new Response(
      JSON.stringify({
        id: profile.id,
        username: profile.name,
        accessToken: mcData.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + mcData.expires_in * 1000,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
