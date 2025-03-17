import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Instead of creating new clients, we'll use the existing supabase client
// and just add the authorization header for authenticated requests

/**
 * Get a Supabase client with the user's access token for authenticated requests
 * This avoids creating multiple GoTrueClient instances by reusing the existing client
 */
export function getAuthenticatedClient(accessToken: string) {
  // Return the existing supabase client with custom headers
  return supabase.auth
    .setSession({
      access_token: accessToken,
      refresh_token: "", // We don't need refresh token for this use case
    })
    .then(() => supabase);
}

// No need for cleanup as we're not creating new clients
export function cleanupAuthenticatedClient(accessToken: string) {
  // No-op as we're not caching clients anymore
  return;
}
