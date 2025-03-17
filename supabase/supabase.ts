import { createClient } from "@supabase/supabase-js";

// Create a single instance of the Supabase client to avoid multiple GoTrueClient instances
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Log environment variables availability for debugging
console.log("Supabase environment variables check:", {
  VITE_SUPABASE_URL: supabaseUrl ? "Available" : "Missing",
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? "Available" : "Missing",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your environment variables.",
    {
      url: supabaseUrl ? "✓" : "✗",
      key: supabaseAnonKey ? "✓" : "✗",
    },
  );
}

// Ensure we have fallback values for development to prevent crashes
const finalSupabaseUrl = supabaseUrl || "https://placeholder-url.supabase.co";
const finalSupabaseAnonKey = supabaseAnonKey || "placeholder-key";

// Create a single instance with the appropriate auth settings
const supabaseInstance = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase-auth", // Ensure consistent storage key
  },
});

// Export the singleton instance
export const supabase = supabaseInstance;

// For admin operations that bypass RLS, use service role key if available
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_KEY || "";
console.log("Service role key available:", !!serviceRoleKey);

// Ensure we have a fallback for the admin client to prevent crashes
const adminInstance = createClient(
  finalSupabaseUrl,
  serviceRoleKey || finalSupabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: "supabase-admin", // Different storage key to avoid conflicts
    },
  },
);

// Export admin client getter function
export function getAdminClient() {
  console.log(
    "Getting admin client with service role key available:",
    !!serviceRoleKey,
  );
  return adminInstance;
}

// Add connection status check
export async function checkSupabaseConnection() {
  try {
    // Use the admin client for connection check
    const { data, error } = await adminInstance
      .from("licenses")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase licenses table check failed:", error);
      // Try another table as a fallback
      const { error: usersError } = await adminInstance
        .from("users")
        .select("count")
        .limit(1);

      if (usersError) {
        console.error("Supabase users table check failed:", usersError);
        throw usersError;
      }
    }

    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection failed:", error);
    return false;
  }
}
