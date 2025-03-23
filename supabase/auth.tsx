import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { toast } from "@/components/ui/use-toast";

// Import modularized auth functions
import {
  AuthContextType,
  UserData,
  fetchUserData,
  signUp as emailSignUp,
  signIn as emailSignIn,
  signOut as authSignOut,
  signInWithDiscord,
  handleDiscordSignup,
  processOAuthCallback,
  verifyEmailToken,
} from "./auth";

// Import refreshSession directly from the session module
import { refreshSession as refreshSessionUtil } from "./auth/session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default export for the component
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to refresh the session and user data
  const refreshSession = async () => {
    try {
      const result = await refreshSessionUtil();
      setUser(result.user);
      setUserData(result.userData);
      setIsAdmin(result.isAdmin);

      if (!result.user) {
        // If no user, might need to sign out
        await signOut();
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      // Clear user state on error
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);
        // Check for session and validate user exists
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("Session found during initialization, validating user");
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
            console.log(
              "User no longer exists in database, signing out during init",
            );
            await signOut();
            return;
          }
        }

        await refreshSession();
        setError(null);
      } catch (e) {
        console.error("Auth initialization error:", e);
        // On error, clear user state and redirect to home
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session?.user) {
        // Check if user exists in the database
        const { data: userExists, error: userCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (userCheckError) {
          console.error("Error checking if user exists:", userCheckError);
        }

        // For OAuth providers like Discord, we need to create a user record if it doesn't exist
        if (
          !userExists &&
          (event === "SIGNED_IN" || event === "USER_UPDATED")
        ) {
          console.log(
            "User doesn't exist in database, creating new user record",
          );

          try {
            await handleDiscordSignup(session.user.id, session.user);
            // Refresh the session to get the latest data
            await refreshSession();
          } catch (error) {
            console.error("Error creating user record for OAuth login:", error);
          }
        } else if (!userExists) {
          console.log("User no longer exists in database, signing out");
          await signOut();
          return;
        }

        setUser(session.user);
        const data = await fetchUserData(session.user.id);
        if (data) {
          setUserData(data);
          setIsAdmin(data.role === "admin");

          // If this is a new sign-in and we have user data, redirect to dashboard
          if (event === "SIGNED_IN") {
            console.log("New sign-in detected, redirecting to dashboard");
            window.location.href = "/dashboard";
          }
        } else {
          // If we can't fetch user data, the user might have been deleted
          console.log("Could not fetch user data, signing out");
          await signOut();
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if we have a verification token in the URL
  useEffect(() => {
    const handleVerification = async () => {
      // Check for various token formats in URL
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get("token_hash");
      const type = params.get("type");
      const email = params.get("email");
      const verification_token = params.get("verification_token");

      // Log all possible token parameters for debugging
      console.log("[Auth] URL parameters:", {
        token_hash,
        type,
        email,
        verification_token,
        full_url: window.location.href,
      });

      // If we don't have any verification tokens, exit early
      if (!token_hash && !verification_token) {
        console.log("[Auth] No verification token found in URL");
        return;
      }

      console.log(
        "[Auth] Found verification token, attempting verification...",
      );

      try {
        // First verify the token
        const { success, data: verificationData } = await verifyEmailToken(
          token_hash || verification_token || "",
          type || "email",
        );

        if (!success) {
          console.error("[Auth] Verification failed");
          toast({
            title: "Verification Failed",
            description:
              "There was a problem verifying your email. Please try signing in.",
            variant: "destructive",
          });
          window.location.href = "/login";
          return;
        }

        console.log("[Auth] Email verified successfully");

        // After verification, try to get the session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("[Auth] Session after verification:", {
          session,
          error: sessionError,
        });

        if (sessionError) {
          console.error(
            "[Auth] Session error after verification:",
            sessionError.message,
          );
          toast({
            title: "Verification Error",
            description:
              "Your email was verified but we couldn't establish a session. Please sign in.",
            variant: "default",
          });
          window.location.href = "/login";
          return;
        }

        if (!session) {
          console.log(
            "[Auth] No session after verification, trying to sign in",
          );

          // If we have the email from the URL, try to sign in
          if (email) {
            toast({
              title: "Email Verified",
              description:
                "Your email has been verified. Please sign in with your credentials.",
              variant: "default",
            });
            window.location.href = `/login?email=${encodeURIComponent(email)}`;
            return;
          } else {
            toast({
              title: "Email Verified",
              description: "Your email has been verified. Please sign in.",
              variant: "default",
            });
            window.location.href = "/login";
            return;
          }
        }

        console.log("[Auth] Session established after verification");

        // If we have a session, update it
        setUser(session.user);

        // Fetch fresh user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        console.log("[Auth] User data after verification:", {
          userData,
          error: userError,
        });

        if (!userError && userData) {
          setUserData(userData);
          setIsAdmin(userData.role === "admin");
        }

        toast({
          title: "Email Verified",
          description: "Your account is now verified. Welcome!",
          variant: "default",
        });

        // Clear URL parameters before redirecting
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("[Auth] Verification error:", error);
        toast({
          title: "Verification Error",
          description:
            "There was a problem verifying your email. Please try signing in.",
          variant: "destructive",
        });
        window.location.href = "/login";
      }
    };

    handleVerification();
  }, []);

  // Original auth callback handler for other auth flows
  useEffect(() => {
    if (!window.location.pathname.includes("/auth/callback")) {
      return;
    }

    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("Auth callback detected, processing authentication");

        // Get the auth code from the URL
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const code = params.get("code");
        const provider = params.get("provider");
        const source = params.get("source");

        console.log("Auth callback parameters:", {
          access_token,
          refresh_token,
          code,
          provider,
          source,
        });

        // Handle OAuth callback (like Discord)
        if (code || provider) {
          console.log("OAuth callback detected", { code, provider });

          try {
            // Process the OAuth callback
            await processOAuthCallback();
            await refreshSession();

            // Handle email verification specifically
            if (source === "email") {
              console.log(
                "Email verification detected, redirecting to login with confirmed=true",
              );
              window.location.href = "/login?confirmed=true";
              return;
            }

            window.history.replaceState({}, document.title, "/");
            window.location.href = "/dashboard";
            return;
          } catch (error) {
            console.error("Error processing OAuth callback:", error);
            throw error;
          }
        }

        // Handle token-based auth (for email verification, etc.)
        if (access_token && refresh_token) {
          console.log("Setting session with tokens");

          try {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            if (data.session?.user) {
              // Check if this is an email verification
              if (source === "email") {
                console.log("Email verification with tokens detected");
                // Create user record if it doesn't exist
                const { data: userExists } = await supabase
                  .from("users")
                  .select("id")
                  .eq("id", data.session.user.id)
                  .maybeSingle();

                if (!userExists) {
                  console.log(
                    "Creating user record for email verification user",
                  );
                  try {
                    const fullName =
                      data.session.user.user_metadata?.full_name ||
                      data.session.user.email?.split("@")[0] ||
                      "User";

                    await handleDiscordSignup(
                      data.session.user.id,
                      data.session.user,
                    );
                  } catch (createError) {
                    console.error(
                      "Error in user creation during email verification:",
                      createError,
                    );
                  }
                }

                await refreshSession();
                window.location.href = "/login?confirmed=true";
                return;
              }

              await refreshSession();
              window.history.replaceState({}, document.title, "/");
              window.location.href = "/dashboard";
            }
          } catch (error) {
            console.error("Error setting session:", error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Auth callback handler error:", error);
        setError(
          error instanceof Error ? error.message : "Authentication error",
        );
        toast({
          title: "Authentication Error",
          description:
            error instanceof Error ? error.message : "Failed to authenticate",
          variant: "destructive",
        });
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  // Wrapper functions to maintain the same interface
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      await emailSignUp(email, password, fullName);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error instanceof Error ? error : new Error("Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await emailSignIn(email, password);

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          setUserData(userData);
          setIsAdmin(userData.role === "admin");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error instanceof Error ? error : new Error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();

      // Force clear user state
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      setError(null);

      // Force redirect to home page
      console.log("Sign out successful, redirecting to home");
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear state and redirect even if there's an error
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  if (error && import.meta.env.DEV) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        isAdmin,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
