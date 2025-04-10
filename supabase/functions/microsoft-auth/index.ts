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

    console.log("Exchanging code for tokens", {
      origin: req.headers.get("origin"),
      redirect_uri: req.headers.get("origin")?.includes("craftology.app")
        ? "https://craftology.app/auth/microsoft"
        : `${req.headers.get("origin")}/auth/microsoft`,
    });
    // Exchange code for tokens
    console.log("Exchanging code for tokens with params:", {
      client_id: clientId,
      code_length: code?.length,
      redirect_uri: "https://craftology.app/auth/microsoft",
    });

    const tokenResponse = await fetch(
      "https://login.live.com/oauth20_token.srf",
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

    // Parse the response as JSON if it's valid
    const tokens = responseText ? JSON.parse(responseText) : null;

    const tokens = await tokenResponse.json();
    console.log("Token response received");

    if (tokens.error) {
      throw new Error(
        `Token error: ${tokens.error_description || tokens.error}`,
      );
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

    // Get XSTS token
    console.log("Getting XSTS token");
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
    console.log("XSTS token received");

    if (xstsData.error) {
      throw new Error(`XSTS error: ${xstsData.error}`);
    }

    // Get Minecraft token
    console.log("Getting Minecraft token");
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
    console.log("Minecraft token received");

    if (mcData.error) {
      throw new Error(`Minecraft error: ${mcData.error}`);
    }

    // Get Minecraft profile
    console.log("Getting Minecraft profile");
    const profileResponse = await fetch(
      "https://api.minecraftservices.com/minecraft/profile",
      {
        headers: {
          Authorization: `Bearer ${mcData.access_token}`,
        },
      },
    );

    const profile = await profileResponse.json();
    console.log("Minecraft profile received");

    if (profile.error) {
      throw new Error(`Profile error: ${profile.error}`);
    }

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
    console.error("Microsoft auth error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
