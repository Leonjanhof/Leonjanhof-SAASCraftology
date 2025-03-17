import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, checkSupabaseConnection, getAdminClient } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Track component mount state

    async function initAuth() {
      try {
        // Check Supabase connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.warn("Unable to connect to Supabase database");
          if (import.meta.env.DEV) {
            setError(
              "Unable to connect to the database. Please try again later.",
            );
          }
          setLoading(false);
          return;
        }

        // Check active sessions
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If we have a session, verify the user exists in the database
        if (session?.user) {
          console.log(
            "Verifying session user exists in database:",
            session.user.id,
          );

          // Use the existing supabase client
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (userError || !existingUser) {
            console.log(
              "Session user not found in database, creating user record:",
              session.user.id,
            );

            // Try to create the user record
            try {
              // Use the admin client to bypass RLS for user creation
              const adminClient = getAdminClient();
              console.log(
                "Using admin client to create user record during session init",
              );

              // Log the user data we're trying to insert
              console.log(
                "Attempting to insert user with ID:",
                session.user.id,
              );
              console.log("User email:", session.user.email);
              console.log("User metadata:", session.user.user_metadata);

              const { error: insertError } = await adminClient
                .from("users")
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  full_name:
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email,
                  user_id: session.user.id,
                  token_identifier: session.user.id,
                  role: "customer",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error("Error creating user record:", insertError);
                await supabase.auth.signOut();
                if (isMounted) {
                  setUser(null);
                  setError(
                    "Your account could not be set up. Please contact support.",
                  );
                  setLoading(false);
                }
                return;
              }

              console.log("User record created successfully for session user");
            } catch (insertErr) {
              console.error("Exception creating user record:", insertErr);
              await supabase.auth.signOut();
              if (isMounted) {
                setUser(null);
                setError(
                  "Your account could not be set up. Please contact support.",
                );
                setLoading(false);
              }
              return;
            }
          } else {
            console.log("Session user verified in database:", existingUser.id);
          }
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
        if (import.meta.env.DEV && isMounted) {
          setError("Authentication service is currently unavailable.");
          setLoading(false);
        }
      }
    }

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);

      // If user is signing in, verify they exist in the database
      if (session?.user) {
        try {
          console.log(
            "Auth state change - verifying user exists:",
            session.user.id,
          );

          // Use the existing supabase client
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (userError || !existingUser) {
            console.log(
              "User from auth state change not found in database, creating user record:",
              session.user.id,
            );

            // For OAuth sign-ins (like Discord), create the user record
            if (event === "SIGNED_IN") {
              try {
                // Use the admin client to bypass RLS for user creation
                const adminClient = getAdminClient();
                console.log(
                  "Using admin client to create user record for OAuth sign-in",
                );

                // Log detailed information for debugging
                console.log("OAuth sign-in - User ID:", session.user.id);
                console.log("OAuth sign-in - User email:", session.user.email);
                console.log(
                  "OAuth sign-in - User metadata:",
                  JSON.stringify(session.user.user_metadata),
                );

                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  full_name:
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email,
                  user_id: session.user.id,
                  token_identifier: session.user.id,
                  role: "customer",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                console.log("Inserting user data:", JSON.stringify(userData));

                const { error: insertError } = await adminClient
                  .from("users")
                  .insert(userData);

                if (insertError) {
                  console.error(
                    "Error creating user record during auth change:",
                    insertError,
                  );
                  await supabase.auth.signOut();
                  if (isMounted) {
                    setUser(null);
                    setError(
                      "Your account could not be set up. Please contact support.",
                    );
                  }
                  return;
                }

                console.log(
                  "User record created successfully during auth change",
                );
              } catch (insertErr) {
                console.error(
                  "Exception creating user record during auth change:",
                  insertErr,
                );
                await supabase.auth.signOut();
                if (isMounted) {
                  setUser(null);
                  setError(
                    "Your account could not be set up. Please contact support.",
                  );
                }
                return;
              }
            } else {
              console.error(
                "User from auth state change not found in database and not a sign-in event, signing out:",
                session.user.id,
              );
              await supabase.auth.signOut();
              if (isMounted) {
                setUser(null);
                setError(
                  "Your account is not properly set up. Please contact support.",
                );
              }
              return;
            }
          } else {
            console.log(
              "User from auth state change verified in database:",
              existingUser.id,
            );
          }
        } catch (e) {
          console.error("Error verifying user in auth state change:", e);
          await supabase.auth.signOut();
          if (isMounted) {
            setUser(null);
          }
          return;
        }
      }

      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      // If signup was successful and we have a user, create an entry in the public.users table
      if (authData.user) {
        console.log("Creating user record for:", authData.user.id);

        // First check if user already exists to avoid duplicate key errors
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", authData.user.id)
          .single();

        if (existingUser) {
          console.log("User already exists in database, skipping insert");
        } else {
          // Insert the new user with all required fields
          // Use the admin client to bypass RLS for user creation
          const adminClient = getAdminClient();
          console.log("Using admin client to create user record during signup");

          const { error: insertError } = await adminClient
            .from("users")
            .insert({
              id: authData.user.id, // Use the same ID as the auth user
              email: email,
              full_name: fullName,
              user_id: authData.user.id,
              token_identifier: authData.user.id, // Using user ID as token identifier
              role: "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating user record:", insertError);
            // Log more details about the error
            console.error("Error details:", JSON.stringify(insertError));
            // We don't throw here to avoid preventing login if DB insert fails
          } else {
            console.log("User record created successfully");
          }
        }
      }

      setError(null);
    } catch (e: any) {
      console.error("Sign up error:", e);
      throw new Error(e.message || "Failed to sign up");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Verify that the user exists in the users table
      if (authData.user) {
        console.log("Checking if user exists in database:", authData.user.id);
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", authData.user.id)
          .single();

        if (userError || !existingUser) {
          console.error(
            "User not found in database, signing out:",
            authData.user.id,
          );
          // User doesn't exist in the users table, sign them out immediately
          await supabase.auth.signOut();
          throw new Error(
            "Your account is not properly set up. Please contact support.",
          );
        }

        console.log("User verified in database:", existingUser.id);
      }

      setError(null);
    } catch (e: any) {
      console.error("Sign in error:", e);
      throw new Error(e.message || "Failed to sign in");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setError(null);
    } catch (e: any) {
      console.error("Sign out error:", e);
      throw new Error(e.message || "Failed to sign out");
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

  // In production, don't show the error screen
  if (error && !import.meta.env.DEV) {
    console.warn("Auth connection error:", error);
  }

  const signInWithDiscord = async () => {
    try {
      console.log("Starting Discord sign in");
      // Use redirectTo to ensure consistent behavior with email/password login
      // This will redirect to /auth/callback which then redirects to /dashboard

      // Log the redirect URL for debugging
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Discord sign-in redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          scopes: "identify email",
          skipBrowserRedirect: true, // Changed to true to handle redirect manually
          // Let Supabase handle the callback URL, which will be processed by AuthCallback.tsx
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      console.log("Discord sign in initiated", data);

      // If we have a URL, redirect the user manually to avoid Fast Refresh issues
      if (data?.url) {
        console.log("Redirecting to:", data.url);
        // Use window.location.assign instead of href for better browser compatibility
        window.location.assign(data.url);
        // Prevent further execution
        return;
      }

      setError(null);
    } catch (e: any) {
      console.error("Discord sign in error:", e);
      throw new Error(e.message || "Failed to sign in with Discord");
    }
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithDiscord,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Also provide a default export for backward compatibility
export default AuthProvider;
