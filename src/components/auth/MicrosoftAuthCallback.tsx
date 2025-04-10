import { useEffect } from "react";
import { supabase } from "../../../supabase/supabase";

export default function MicrosoftAuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        console.log("Auth callback received:", {
          code: code?.substring(0, 10) + "...",
          state,
        });

        if (!code) throw new Error("No code provided");

        // Exchange code for tokens using Supabase edge function
        console.log("Invoking edge function with code", {
          codeLength: code?.length,
        });
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-microsoft-auth",
          {
            body: { code },
          },
        );

        if (error) throw error;

        // Send success message to parent window
        console.log("Sending success message to parent window", {
          id: data.id,
          username: data.username,
        });
        window.opener?.postMessage(
          {
            type: "MICROSOFT_AUTH_SUCCESS",
            state: state, // Include state parameter for security validation
            account: {
              id: data.id,
              username: data.username,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresAt: data.expiresAt,
            },
          },
          window.location.origin,
        );
      } catch (error) {
        console.error("Microsoft auth error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        window.opener?.postMessage(
          {
            type: "MICROSOFT_AUTH_ERROR",
            error: error.message,
          },
          window.location.origin,
        );
      }
    };

    handleAuth();
  }, []);

  return null;
}
