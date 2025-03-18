import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Please check your environment variables.",
    {
      url: supabaseUrl ? "✓" : "✗",
      key: supabaseAnonKey ? "✓" : "✗",
    },
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Add connection status check
export async function checkSupabaseConnection() {
  try {
    // First try to check if we can access the database at all
    const { data, error } = await supabase
      .from("licenses")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase licenses table check failed:", error);
      // Try another table as a fallback
      const { error: usersError } = await supabase
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
