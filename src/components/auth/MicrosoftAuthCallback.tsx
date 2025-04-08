import { useEffect } from "react";
import { supabase } from "../../../supabase/supabase";

export default function MicrosoftAuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get code from URL
        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) throw new Error("No code provided");

        // Exchange code for tokens using Supabase edge function
        const { data, error } = await supabase.functions.invoke(
          "microsoft-auth",
          {
            body: { code },
          },
        );

        if (error) throw error;

        // Send success message to parent window
        window.opener?.postMessage(
          {
            type: "MICROSOFT_AUTH_SUCCESS",
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
