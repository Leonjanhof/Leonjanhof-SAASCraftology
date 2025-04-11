import { supabase } from "../../../supabase/supabase";

// Function to check if a token needs refreshing
export async function checkAndRefreshTokens() {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Get all Microsoft accounts for the current user
    const { data: accounts, error } = await supabase
      .from("minecraft_accounts")
      .select("*")
      .eq("user_id", userData.user.id);

    if (error) throw error;
    if (!accounts || accounts.length === 0) return;

    // Check each account for token expiration
    const now = new Date();
    const refreshPromises = accounts.map(async (account) => {
      // If token_expires_at is null or the token has expired
      if (
        !account.token_expires_at ||
        new Date(account.token_expires_at) <= now
      ) {
        // Call the edge function to refresh the token
        // This is a placeholder - in a real implementation, you would call your token refresh endpoint
        console.log(`Refreshing token for account ${account.id}`);

        // Update the last_refresh_at timestamp
        const { error: updateError } = await supabase
          .from("minecraft_accounts")
          .update({
            last_refresh_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", account.id);

        if (updateError) {
          console.error(
            `Error updating refresh timestamp for account ${account.id}:`,
            updateError,
          );
        }
      }
    });

    await Promise.all(refreshPromises);
  } catch (error) {
    console.error("Error checking and refreshing tokens:", error);
  }
}

// Function to set up a periodic token refresh
export function setupTokenRefresh(intervalMinutes = 60) {
  // Check tokens immediately
  checkAndRefreshTokens();

  // Set up interval to check tokens periodically
  const intervalId = setInterval(
    checkAndRefreshTokens,
    intervalMinutes * 60 * 1000,
  );

  // Return a function to clear the interval
  return () => clearInterval(intervalId);
}
