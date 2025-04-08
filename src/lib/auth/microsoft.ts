export interface MicrosoftAccount {
  id: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function openMicrosoftLogin(): Promise<MicrosoftAccount | null> {
  return new Promise((resolve) => {
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(7);

    // Construct Microsoft OAuth URL
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "",
      response_type: "code",
      redirect_uri: `${window.location.origin}/auth/microsoft`,
      scope: "XboxLive.signin offline_access",
      state,
    });

    const authUrl = `https://login.live.com/oauth20_authorize.srf?${params}`;

    // Open popup window
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "Microsoft Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Check if popup was blocked
    if (!popup) {
      console.error("Popup was blocked");
      resolve(null);
      return;
    }

    // Handle popup closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve(null);
      }
    }, 500);

    // Handle message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "MICROSOFT_AUTH_SUCCESS") {
        // Validate state parameter
        if (event.data.state !== state) {
          console.error("Invalid state parameter");
          resolve(null);
          return;
        }

        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        popup?.close();
        resolve(event.data.account);
      } else if (event.data?.type === "MICROSOFT_AUTH_ERROR") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        popup?.close();
        console.error("Microsoft auth error:", event.data.error);
        resolve(null);
      }
    };

    window.addEventListener("message", handleMessage);
  });
}
