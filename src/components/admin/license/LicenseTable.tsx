import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, CheckCircle, Loader2, Trash2, XCircle } from "lucide-react";
import { License } from "./types";

interface LicenseTableProps {
  licenses: License[];
  isLoading: boolean;
  searchQuery: string;
  licenseToDelete: License | null;
  isDeleting: boolean;
  onExtend: (license: License) => void;
  onDelete: (license: License) => void;
  onConfirmDelete: () => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const LicenseTable: React.FC<LicenseTableProps> = ({
  licenses,
  isLoading,
  searchQuery,
  licenseToDelete,
  isDeleting,
  onExtend,
  onDelete,
  onConfirmDelete,
  currentPage,
  totalPages,
  totalCount,
  onPrevPage,
  onNextPage,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">
          {searchQuery
            ? "No licenses found matching your search."
            : "No licenses found in the system."}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Key</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map((license) => (
            <TableRow key={license.id}>
              <TableCell className="font-mono text-xs">
                {license.license_key}
              </TableCell>
              <TableCell>{license.user_email || "Unknown"}</TableCell>
              <TableCell>{license.product_name}</TableCell>
              <TableCell>
                <Badge
                  variant={license.active ? "default" : "outline"}
                  className={
                    license.active
                      ? "bg-green-400 hover:bg-green-500"
                      : "text-gray-500 border-gray-300"
                  }
                >
                  {license.active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(license.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {license.expires_at
                  ? new Date(license.expires_at).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExtend(license)}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete License</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this license? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onDelete(license);
                            setTimeout(onConfirmDelete, 100);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isDeleting && licenseToDelete?.id === license.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete License"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <LicensePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        licenses={licenses}
      />
    </div>
  );
};

interface LicensePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  licenses: License[];
}

const LicensePagination: React.FC<LicensePaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  onPrevPage,
  onNextPage,
  licenses,
}) => {
  return (
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
      <div className="text-sm text-gray-500">
        Showing {licenses.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
        {Math.min(currentPage * 10, totalCount)} of {totalCount} licenses
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default LicenseTable;
