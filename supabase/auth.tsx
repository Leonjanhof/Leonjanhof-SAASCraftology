import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type UserRole = "admin" | "user";

type UserData = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  permissions?: string[];
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
};

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

  // Function to fetch user data from the database
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      // First, get user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role_name")
        .eq("user_id", userId)
        .single();

      if (roleError && roleError.code !== "PGRST116") {
        console.error("Error fetching user role:", roleError);
      }

      // Then get user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return null;
      }

      return {
        id: userId,
        email: userData.email || "",
        full_name: userData.full_name || "",
        role: (roleData?.role_name as UserRole) || "user",
        permissions: ["access_dashboard", "manage_own_licenses", "update_profile"],
      };
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return null;
    }
  };

  // Function to refresh the session and user data
  const refreshSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        setUser(session.user);
        const data = await fetchUserData(session.user.id);
        if (data) {
          setUserData(data);
          setIsAdmin(data.role === "admin");
        }
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);
        await refreshSession();
        setError(null);
      } catch (e) {
        console.error("Auth initialization error:", e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        setUser(session.user);
        const data = await fetchUserData(session.user.id);
        if (data) {
          setUserData(data);
          setIsAdmin(data.role === "admin");
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle email confirmation and auth callbacks
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        const error = params.get('error');
        const error_description = params.get('error_description');

        // Handle errors
        if (error) {
          console.error("Auth callback error:", error, error_description);
          throw new Error(error_description || "Authentication error");
        }

        // Handle successful auth
        if ((access_token && refresh_token) || type === 'email_confirmation') {
          setLoading(true);
          
          try {
            let session;
            if (access_token && refresh_token) {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (error) throw error;
              session = data.session;
            } else {
              const { data, error } = await supabase.auth.getSession();
              if (error) throw error;
              session = data.session;
            }

            if (session?.user) {
              // Ensure user role exists
              const { error: roleError } = await supabase
                .from("user_roles")
                .upsert(
                  {
                    user_id: session.user.id,
                    role_name: "user",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id" }
                );

              if (roleError) {
                console.error("Error ensuring user role:", roleError);
              }

              // Refresh user data
              await refreshSession();

              // Clear URL parameters
              window.history.replaceState({}, document.title, window.location.pathname);

              // Redirect to dashboard
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error("Error in auth callback:", error);
            throw error;
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth callback handler error:", error);
        setError(error instanceof Error ? error.message : "Authentication error");
      }
    };

    handleAuthCallback();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Sign up with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (authData.user) {
        try {
          // Create user record
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            token_identifier: authData.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user record:", insertError);
          }

          // Create user role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role_name: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (roleError) {
            console.error("Error creating user role:", roleError);
            // Try upsert as fallback
            const { error: upsertError } = await supabase.from("user_roles").upsert(
              {
                user_id: authData.user.id,
                role_name: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
            if (upsertError) {
              console.error("Error upserting user role:", upsertError);
            }
          }
        } catch (error) {
          console.error("Error in user creation:", error);
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error instanceof Error ? error : new Error('Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          throw new Error("Email not confirmed");
        }

        const userData = await fetchUserData(data.user.id);
        if (userData) {
          setUserData(userData);
          setIsAdmin(userData.role === "admin");
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error instanceof Error ? error : new Error('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      setError(null);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error instanceof Error ? error : new Error('Failed to sign out');
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
