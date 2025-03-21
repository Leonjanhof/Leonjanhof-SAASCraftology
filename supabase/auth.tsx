import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type UserRole = "user" | "admin";

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
  const fetchUserData = async (userId: string, userData?: any) => {
    // If userData is already provided, use it instead of making a database call
    if (userData && userData.full_name) {
      return {
        id: userId,
        email: userData.email || "",
        full_name: userData.full_name || "",
        role: userData.role || "user",
      } as UserData;
    }

    try {
      // First try to get user metadata from auth.users
      const { data: authUser } = await supabase.auth.getUser();
      const userMetadata = authUser?.user?.user_metadata;

      // Get user role from the user_roles table
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role_name")
        .eq("user_id", userId)
        .single();

      // Get user permissions based on their role
      let permissions: string[] = [];
      if (userRole?.role_name) {
        const { data: permissionsData } = await supabase
          .from("role_permissions")
          .select("permission")
          .eq("role_name", userRole.role_name);

        permissions = permissionsData?.map((p) => p.permission) || [];
      }

      // If we have user metadata, use it for basic info
      if (userMetadata && userMetadata.full_name) {
        return {
          id: userId,
          email: authUser?.user?.email || "",
          full_name: userMetadata.full_name || "",
          role: userRole?.role_name || "user",
          permissions,
        } as UserData;
      }

      // If that fails, try the database query with a timeout
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Database query timeout")), 3000);
      });

      const queryPromise = supabase
        .from("users")
        .select("id, email, full_name")
        .eq("id", userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])
        .then(
          (result) =>
            result as typeof queryPromise extends Promise<infer T> ? T : never,
        )
        .catch((err) => {
          console.error("Timeout or error fetching user data:", err);
          return { data: null, error: err };
        });

      if (error) {
        console.error("Error fetching user data:", error);
        // Return a default user object to prevent blocking the auth flow
        return {
          id: userId,
          email: authUser?.user?.email || "",
          full_name: userMetadata?.full_name || "User",
          role: userRole?.role_name || "user",
          permissions,
        } as UserData;
      }

      return {
        ...data,
        role: userRole?.role_name || "user",
        permissions,
      } as UserData;
    } catch (error) {
      console.error("Exception fetching user data:", error);
      // Return a default user object to prevent blocking the auth flow
      return {
        id: userId,
        email: "",
        full_name: "User",
        role: "user",
        permissions: [],
      } as UserData;
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);

        // Check active sessions
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);

          // Use user metadata first if available
          const userMetadata = session.user.user_metadata;

          // Fetch additional user data from the database
          const data = await fetchUserData(session.user.id, userMetadata);
          if (data) {
            setUserData(data);
            setIsAdmin(data.role === "admin");
          } else if (userMetadata) {
            // Fallback to metadata only
            const basicUserData = {
              id: session.user.id,
              email: session.user.email || "",
              full_name: userMetadata.full_name || "User",
              role: userMetadata.role || "user",
            };
            setUserData(basicUserData as UserData);
            setIsAdmin(basicUserData.role === "admin");
          }
        } else {
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
        }

        setError(null);
      } catch (e) {
        console.error("Auth initialization error:", e);
        // Don't set error to prevent blocking the UI
        // setError("Authentication service is currently unavailable.");
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Use user metadata first if available
        const userMetadata = session.user.user_metadata;

        // Fetch additional user data from the database
        const data = await fetchUserData(session.user.id, userMetadata);
        if (data) {
          setUserData(data);
          setIsAdmin(data.role === "admin");
        } else if (userMetadata) {
          // Fallback to metadata only
          const basicUserData = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: userMetadata.full_name || "User",
            role: userMetadata.role || "user",
          };
          setUserData(basicUserData as UserData);
          setIsAdmin(basicUserData.role === "admin");
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      // Sign up the user with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      // If signup was successful and we have a user, create an entry in the public.users table
      if (authData.user) {
        console.log("Creating user record for:", authData.user.id);

        try {
          // Insert the new user with all required fields
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            token_identifier: authData.user.id, // Use user ID as token identifier
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user record:", insertError);
            // Continue anyway - the auth record is created
            console.log("Continuing with auth record only");
          }

          // The trigger function will automatically add the user role
          // but we'll also try to add it explicitly as a fallback
          const { error: roleError } = await supabase.from("user_roles").upsert(
            {
              user_id: authData.user.id,
              role_name: "user",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            },
          );

          if (roleError) {
            console.error("Error creating user role:", roleError);
          }
        } catch (insertErr) {
          console.error("Exception creating user record:", insertErr);
          // Continue anyway - the auth record is created
          console.log("Continuing with auth record only");
        }

        // Set user data from the metadata to avoid database query
        if (authData.user.user_metadata) {
          const userData = {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: "user",
            permissions: [
              "access_dashboard",
              "manage_own_licenses",
              "update_profile",
            ],
          };
          setUserData(userData as UserData);
        }
      }

      setError(null);
    } catch (e: any) {
      console.error("Sign up error:", e);
      throw new Error(e.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.status === 400) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password");
          } else if (error.message.includes("Email not confirmed")) {
            throw new Error("Email not confirmed");
          }
        }
        throw error;
      }

      // Check if the user's email is verified
      if (data.user && !data.user.email_confirmed_at) {
        console.warn("User email not verified:", data.user.email);
        // Check if the user exists in the database despite not being verified
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error("Email not confirmed");
        } else {
          console.log("User exists in database despite unverified email");
        }
      }

      if (data.user) {
        // Use user metadata first if available
        const userMetadata = data.user.user_metadata;

        // Fetch additional user data from the database
        const userData = await fetchUserData(data.user.id, userMetadata);
        if (userData) {
          setUserData(userData);
          setIsAdmin(userData.role === "admin");
        } else {
          // Fallback to basic user data
          const basicUserData = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: userMetadata?.full_name || "User",
            role: userMetadata?.role || "user",
          };
          setUserData(basicUserData as UserData);
          setIsAdmin(basicUserData.role === "admin");
        }
      }

      setError(null);
    } catch (e: any) {
      console.error("Sign in error:", e);
      // Don't wrap the error in another Error object if it's already formatted
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error(e.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
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
