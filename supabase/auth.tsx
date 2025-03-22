import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { toast } from "@/components/ui/use-toast";

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
    // Only run this if we're on the callback route
    if (!window.location.pathname.includes('/auth/callback')) {
      return;
    }

    const handleAuthCallback = async () => {
      try {
        // Log the full URL first
        console.log("Full callback URL:", window.location.href);
        
        const params = new URLSearchParams(window.location.search);
        // Log all parameters
        const allParams = {};
        params.forEach((value, key) => {
          allParams[key] = value;
        });
        console.log("All URL parameters:", allParams);

        // Check for both standard tokens and email confirmation token
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const token_hash = params.get('token_hash') || params.get('token');
        const type = params.get('type');
        const error = params.get('error');
        const error_description = params.get('error_description');

        // If no auth parameters, redirect to home
        if (!access_token && !refresh_token && !token_hash) {
          console.log("No auth parameters found, redirecting to home");
          window.location.href = '/';
          return;
        }

        // Handle errors
        if (error) {
          console.error("Auth callback error:", error, error_description);
          throw new Error(error_description || "Authentication error");
        }

        // Log the confirmation attempt
        console.log("Attempting confirmation with:", {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          hasTokenHash: !!token_hash,
          type,
        });

        // Handle email confirmation token
        if (token_hash) {
          setLoading(true);
          console.log("Processing confirmation token");
          
          try {
            // Try to verify the email
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash,
              type: 'email_confirmation'
            });
            
            console.log("Verification response:", { success: !verifyError, data });

            if (verifyError) {
              console.error("Verification error:", verifyError);
              throw verifyError;
            }

            // Get the updated session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            if (session?.user) {
              await refreshSession();
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.href = '/dashboard';
            } else {
              window.location.href = '/login';
            }
          } catch (error) {
            console.error("Error in confirmation flow:", error);
            throw error;
          }
        }
        // Handle access tokens
        else if (access_token && refresh_token) {
          setLoading(true);
          console.log("Setting session with tokens");
          
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;
            
            if (data.session?.user) {
              await refreshSession();
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error("Error setting session:", error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Auth callback handler error:", error);
        setError(error instanceof Error ? error.message : "Authentication error");
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to verify email",
          variant: "destructive"
        });
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Starting signup process");

      // Sign up with Supabase Auth - remove the type parameter
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

      console.log("Signup response:", {
        userId: authData.user?.id,
        session: !!authData.session,
        confirmationSent: !authData.session && !!authData.user
      });

      if (authData.user) {
        try {
          // Create user record only - role will be created by trigger
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

          // Show success message with more details
          toast({
            title: "Verification Email Sent",
            description: "Please check your email (including spam folder) to verify your account. The link will redirect you back to complete the signup.",
          });

        } catch (error) {
          console.error("Error in user creation:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      });
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
