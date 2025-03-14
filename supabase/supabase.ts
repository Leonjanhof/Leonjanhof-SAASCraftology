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
    const { data, error } = await supabase
      .from("licenses")
      .select("count")
      .limit(1);
    if (error) throw error;
    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Supabase connection failed:", error);
    return false;
  }
}
