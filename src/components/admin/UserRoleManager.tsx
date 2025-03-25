import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  UserCog,
} from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

const USERS_PER_PAGE = 10;

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
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-manage-user-role",
        {
          body: {
            targetUserEmail: targetEmail,
            newRole: selectedRole,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}`,
        variant: "default",
      });

      setTargetEmail("");
      setSelectedRole("user");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsUpdatingRole(true);
      setSelectedUserForUpdate(userId);

      const userToUpdate = users.find((user) => user.id === userId);
      if (!userToUpdate) throw new Error("User not found");

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-manage-user-role",
        {
          body: {
            userId: userToUpdate.user_id,
            newRole: newRole,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
        variant: "default",
      });

      // Refresh the user list to get updated data
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
      setSelectedUserForUpdate(null);
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

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-manage-user-role",
        {
          body: {
            userId: selectedUserForRoleChange.user_id,
            newRole: newRoleValue,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRoleValue}`,
        variant: "default",
      });

      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Current Users</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-8 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleSearch}>
                  Search
                </Button>
                <Button variant="outline" size="sm" onClick={fetchUsers}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No users found matching your search."
                    : "No user roles found in the system."}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.full_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.updated_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role_name === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role_name === "admin" ? (
                              <UserCheck className="h-3 w-3 mr-1" />
                            ) : (
                              <UserX className="h-3 w-3 mr-1" />
                            )}
                            {user.role_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(user)}
                              className="h-8 flex items-center"
                            >
                              <UserCog className="h-4 w-4 mr-1" />
                              Set Role
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user?
                                    This will remove all user data including
                                    licenses, subscriptions, reviews, and
                                    authentication information. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setTimeout(handleDeleteUser, 100);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    {isDeleting &&
                                    userToDelete?.id === user.id ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete User"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    {displayedUsers.length > 0
                      ? (currentPage - 1) * USERS_PER_PAGE + 1
                      : 0}{" "}
                    to {Math.min(currentPage * USERS_PER_PAGE, totalCount)} of{" "}
                    {totalCount} users
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for user {selectedUserForRoleChange?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={newRoleValue} onValueChange={setNewRoleValue}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={isUpdatingRole}
              className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
            >
              {isUpdatingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <span className="relative z-10 transition-colors duration-300">
                    Update Role
                  </span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

export default UserRoleManager;
