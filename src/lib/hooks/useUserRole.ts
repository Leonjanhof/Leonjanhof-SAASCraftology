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

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        setError(err.message || "Failed to fetch user role");
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return { role, permissions, isAdmin, loading, error };
}
