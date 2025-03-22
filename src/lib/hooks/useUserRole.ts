import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";

type UserRoleData = {
  role: string;
  permissions: string[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
};

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<string>("user");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First try to get role from database directly as a fallback
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role_name")
            .eq("user_id", user.id)
            .single();

          if (!roleError && roleData) {
            console.log("Got user role from database:", roleData.role_name);
            setRole(roleData.role_name);
            setIsAdmin(roleData.role_name === "admin");

            // Get basic permissions
            if (roleData.role_name === "admin") {
              setPermissions([
                "access_dashboard",
                "manage_own_licenses",
                "update_profile",
                "manage_users",
              ]);
            } else {
              setPermissions([
                "access_dashboard",
                "manage_own_licenses",
                "update_profile",
              ]);
            }
          }
        } catch (dbError) {
          console.log(
            "Couldn't get role from database directly, trying edge function",
          );
        }

        // Try the edge function
        const { data, error } =
          await supabase.functions.invoke("get-user-role");

        if (error) {
          throw error;
        }

        if (data) {
          setRole(data.role);
          setPermissions(data.permissions);
          setIsAdmin(data.isAdmin);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching user role:", err);

        // Retry logic - try up to 3 times with increasing delay
        if (retryCount < 3) {
          console.log(`Retrying user role fetch (${retryCount + 1}/3)...`);
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, delay);
          return; // Don't set error or finish loading yet
        }

        setError(err.message || "Failed to fetch user role");
      } finally {
        // Only set loading to false if we're not retrying
        if (retryCount >= 3) {
          setLoading(false);
        }
      }
    }

    fetchUserRole();
  }, [user, retryCount]);

  return { role, permissions, isAdmin, loading, error };
}
