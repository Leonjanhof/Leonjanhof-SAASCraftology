import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, checkSupabaseConnection } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Changed to default export for the component
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        setUser(session?.user ?? null);
        setError(null);
      } catch (e) {
        console.error("Auth initialization error:", e);
        if (import.meta.env.DEV) {
          setError("Authentication service is currently unavailable.");
        }
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id, // Use the same ID as the auth user
            email: email,
            full_name: fullName,
            user_id: authData.user.id,
            token_identifier: authData.user.id, // Using user ID as token identifier
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
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

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Separate named export for the hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
