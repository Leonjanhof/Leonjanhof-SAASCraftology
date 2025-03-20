import { useUserRole } from "./useUserRole";

export function usePermission(requiredPermission: string): boolean {
  const { permissions, isAdmin, loading } = useUserRole();

  // Admins have all permissions
  if (isAdmin) return true;

  // If still loading, be conservative and deny access
  if (loading) return false;

  // Check if the user has the required permission
  return permissions.includes(requiredPermission);
}
