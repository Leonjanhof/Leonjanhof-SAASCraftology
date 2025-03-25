import React, { useState, useEffect } from "react";
import { supabase } from "../../../../supabase/supabase";
import { useAuth } from "../../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserWithRole, USERS_PER_PAGE } from "./types";
import UserRoleSearch from "./UserRoleSearch";
import UserRoleTable from "./UserRoleTable";
import RoleChangeDialog from "./RoleChangeDialog";

const UserRoleManager = React.forwardRef((props, ref) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<
    string | null
  >(null);
  const [roleForUpdate, setRoleForUpdate] = useState<string>("user");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] =
    useState<UserWithRole | null>(null);
  const [newRoleValue, setNewRoleValue] = useState<string>("user");

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredUsers(filtered);
    setDisplayedUsers(filtered);
  }, [searchQuery, users]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalCount / USERS_PER_PAGE)));
  }, [totalCount]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Call the edge function to get user roles data
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-user-roles-data",
        {
          body: {
            page: currentPage,
            pageSize: USERS_PER_PAGE,
            searchQuery: searchQuery,
          },
        },
      );

      if (error) {
        throw error;
      }

      if (!data || !data.data) {
        setUsers([]);
        setFilteredUsers([]);
        setDisplayedUsers([]);
        setTotalCount(0);
        return;
      }

      setUsers(data.data);
      setFilteredUsers(data.data);
      setDisplayedUsers(data.data);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast({
        title: "Error",
        description: "Failed to load user roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!targetEmail) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("manage_user_role", {
        admin_user_id: user.id,
        target_user_email: targetEmail,
        new_role: selectedRole,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.message || "Failed to update user role");
      }

      toast({
        title: "Success",
        description: data?.message || `User role updated to ${selectedRole}`,
        variant: "default",
      });

      setTargetEmail("");
      setSelectedRole("user");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRoleDialog = (user: UserWithRole) => {
    setSelectedUserForRoleChange(user);
    setNewRoleValue(user.role_name);
    setIsRoleDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUserForRoleChange || !newRoleValue) return;

    try {
      setIsUpdatingRole(true);

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("manage_user_role", {
        admin_user_id: user.id,
        target_user_email: selectedUserForRoleChange.email,
        new_role: newRoleValue,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.message || "Failed to update user role");
      }

      toast({
        title: "Success",
        description: data?.message || `User role updated to ${newRoleValue}`,
        variant: "default",
      });

      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-delete-user",
        {
          body: {
            userId: userToDelete.user_id,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${userToDelete.email} has been deleted`,
        variant: "default",
      });

      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setSelectedUserForRoleChange(null);
  };

  // Expose fetchUsers method to parent components via ref
  React.useImperativeHandle(ref, () => ({
    fetchUsers,
  }));

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>
          Assign or change roles for users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mt-0">
            <UserRoleSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              onRefresh={fetchUsers}
            />

            <UserRoleTable
              displayedUsers={displayedUsers}
              loading={loading}
              searchQuery={searchQuery}
              userToDelete={userToDelete}
              isDeleting={isDeleting}
              onOpenRoleDialog={handleOpenRoleDialog}
              onDelete={setUserToDelete}
              onConfirmDelete={handleDeleteUser}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </div>
        </div>
      </CardContent>

      <RoleChangeDialog
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        selectedUser={selectedUserForRoleChange}
        newRoleValue={newRoleValue}
        setNewRoleValue={setNewRoleValue}
        isUpdatingRole={isUpdatingRole}
        onSubmit={handleRoleChange}
        onCancel={handleCloseRoleDialog}
      />
    </Card>
  );
});

export default UserRoleManager;
