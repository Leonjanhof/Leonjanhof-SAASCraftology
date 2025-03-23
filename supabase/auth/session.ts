import { supabase } from "../supabase";
import { fetchUserData } from "./utils";

// Function to refresh the session and user data
export const refreshSession = async () => {
  try {
    // Check if we have a stored session flag
    const hasStoredSession =
      localStorage.getItem("auth_session_active") === "true";
    console.log("Refreshing session, stored session flag:", hasStoredSession);

    // Add retry logic for getSession
    let session = null;
    let sessionError = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        sessionError = result.error;
        if (!sessionError) break;

        console.log(
          `Session fetch attempt ${attempts + 1} failed, retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        attempts++;
      } catch (e) {
        console.error(`Session fetch attempt ${attempts + 1} exception:`, e);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        attempts++;
      }
    }

    if (sessionError) throw sessionError;

    if (session?.user) {
      // Check if user still exists in the database
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (userCheckError) {
        console.error("Error checking if user exists:", userCheckError);
      }

      if (!userExists) {
        console.log("User no longer exists in database");
        return { user: null, userData: null, isAdmin: false };
      }

      const userData = await fetchUserData(session.user.id);
      if (userData) {
        return {
          user: session.user,
          userData,
          isAdmin: userData.role === "admin",
        };
      } else {
        // If we can't fetch user data, the user might have been deleted
        console.log("Could not fetch user data");
        return { user: null, userData: null, isAdmin: false };
      }
    } else {
      // No session exists
      return { user: null, userData: null, isAdmin: false };
    }
  } catch (error) {
    console.error("Error refreshing session:", error);
    // Return null state on error
    return { user: null, userData: null, isAdmin: false };
  }
};

export const verifyEmailToken = async (tokenHash: string, type: string) => {
  try {
    console.log("Verifying email token");

    // Verify the token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type || "email",
    });

    if (error) {
      console.error("Verification failed:", error.message);
      throw error;
    }

    console.log("Email verified successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Error in verifyEmailToken:", error);
    throw error;
  }
};
