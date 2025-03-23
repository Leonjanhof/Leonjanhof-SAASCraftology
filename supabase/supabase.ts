import { createClient } from "@supabase/supabase-js";

// Create a single instance of the Supabase client to avoid multiple GoTrueClient instances
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables availability for debugging
console.log("Supabase configuration:", {
  url: supabaseUrl ? "✓" : "✗",
  anonKey: supabaseAnonKey ? "✓" : "✗",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your environment variables.",
  );
}

// Create a single instance with the appropriate auth settings and explicit headers
// Ensure we have valid strings for URL and key, with fallbacks that will prevent runtime errors
const validSupabaseUrl =
  typeof supabaseUrl === "string" && supabaseUrl.trim() !== ""
    ? supabaseUrl
    : "https://placeholder-url.supabase.co";
const validSupabaseAnonKey =
  typeof supabaseAnonKey === "string" && supabaseAnonKey.trim() !== ""
    ? supabaseAnonKey
    : "placeholder-key";

export const supabase = createClient(validSupabaseUrl, validSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item;
        } catch (error) {
          console.error("Error getting auth item from storage:", error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Error setting auth item to storage:", error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Error removing auth item from storage:", error);
        }
      },
    },
  },
  global: {
    headers: {
      apikey: supabaseAnonKey || "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
});

// For admin operations that bypass RLS, use service role key if available
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_KEY;
console.log("Service role key available:", !!serviceRoleKey);

// Export admin client getter function
export function getAdminClient() {
  if (!serviceRoleKey) {
    console.warn("Service role key is not available, using anon key instead");
    return supabase;
  }

  return createClient(validSupabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  });
}

// Add connection status check with retry logic
export async function checkSupabaseConnection(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      // Try reviews table first as it has less restrictive policies
      const { data, error } = await supabase
        .from("reviews")
        .select("count")
        .limit(1);

      if (error) {
        console.error(`Supabase connection attempt ${i + 1} failed:`, error);
        // Try another table as a fallback
        const { error: licensesError } = await supabase
          .from("licenses")
          .select("count")
          .limit(1);

        if (licensesError) {
          console.error(
            `Licenses table check attempt ${i + 1} failed:`,
            licensesError,
          );
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          return false;
        }
      }

      console.log("Supabase connection successful");
      return true;
    } catch (error) {
      console.error(`Supabase connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return false;
    }
  }

  return false;
}
