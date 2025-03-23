import { supabase } from "../supabase";
import { fetchUserData } from "./utils";
import { toast } from "@/components/ui/use-toast";

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Starting sign-in process");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      if (!data.user.email_confirmed_at) {
        throw new Error("Email not confirmed");
      }

      // Fetch user data to verify the user exists in our database
      const userData = await fetchUserData(data.user.id);
      if (!userData) {
        console.error("User data not found after sign in");
      }
    }

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error instanceof Error ? error : new Error("Failed to sign in");
  }
};

export const signInWithDiscord = async () => {
  try {
    // Make sure we're using the correct redirect URL
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log("Using redirect URL for Discord sign-in:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: redirectUrl,
        scopes: "identify email", // Simplified scopes to reduce permissions requested
      },
    });

    if (error) throw error;

    if (data?.url) {
      console.log("Redirecting to Discord OAuth:", data.url);
      // Show a toast before redirecting
      toast({
        title: "Redirecting to Discord",
        description: "You'll be redirected to Discord to complete sign in.",
      });

      return data;
    }

    throw new Error("No redirect URL returned from Discord sign-in attempt");
  } catch (error) {
    console.error("Discord login error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    console.log("Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    console.log("Sign out successful");
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};
