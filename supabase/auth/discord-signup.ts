import { supabase } from "../supabase";
import { createUserRecord } from "./utils";

export const handleDiscordSignup = async (userId: string, userData: any) => {
  try {
    // Extract user information from the session
    const fullName =
      userData.user_metadata?.full_name ||
      userData.user_metadata?.name ||
      userData.user_metadata?.preferred_username ||
      userData.email?.split("@")[0] ||
      "User";

    const avatarUrl = userData.user_metadata?.avatar_url;

    // Create user record and role
    await createUserRecord(userId, userData.email, fullName, avatarUrl);

    return { success: true };
  } catch (error) {
    console.error("Error in handleDiscordSignup:", error);
    throw error;
  }
};

export const processOAuthCallback = async () => {
  try {
    console.log("Processing OAuth callback");

    // Get the current session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session after OAuth:", error);
      throw error;
    }

    if (!data.session?.user) {
      console.error("No user found in session after OAuth callback");
      throw new Error("Authentication failed - no user in session");
    }

    // Check if user exists in database
    const { data: userExists } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.session.user.id)
      .maybeSingle();

    // If user doesn't exist, create the user record
    if (!userExists) {
      console.log("Creating user record for OAuth user");
      await handleDiscordSignup(data.session.user.id, data.session.user);

      // Wait for any triggers to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log("User already exists in database, skipping creation");
    }

    return { success: true, user: data.session.user };
  } catch (error) {
    console.error("Error in processOAuthCallback:", error);
    throw error;
  }
};
