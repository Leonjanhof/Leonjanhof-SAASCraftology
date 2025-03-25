import React from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserCog,
  UserCheck,
  UserX,
} from "lucide-react";
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
import { UserWithRole, USERS_PER_PAGE } from "./types";

interface UserRoleTableProps {
  displayedUsers: UserWithRole[];
  loading: boolean;
  searchQuery: string;
  userToDelete: UserWithRole | null;
  isDeleting: boolean;
  onOpenRoleDialog: (user: UserWithRole) => void;
  onDelete: (user: UserWithRole) => void;
  onConfirmDelete: () => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const UserRoleTable: React.FC<UserRoleTableProps> = ({
  displayedUsers,
  loading,
  searchQuery,
  userToDelete,
  isDeleting,
  onOpenRoleDialog,
  onDelete,
  onConfirmDelete,
  currentPage,
  totalPages,
  totalCount,
  onPrevPage,
  onNextPage,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (displayedUsers.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">
          {searchQuery
            ? "No users found matching your search."
            : "No user roles found in the system."}
        </p>
      </div>
    );
  }

  return (
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
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.full_name}</div>
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
                    onClick={() => onOpenRoleDialog(user)}
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
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this user? This will
                          remove all user data including licenses,
                          subscriptions, reviews, and authentication
                          information. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDelete(user);
                            setTimeout(onConfirmDelete, 100);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isDeleting && userToDelete?.id === user.id ? (
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
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserRoleTable;
