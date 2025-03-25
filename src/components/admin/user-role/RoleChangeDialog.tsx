import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UserWithRole } from "./types";

interface RoleChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserWithRole | null;
  newRoleValue: string;
  setNewRoleValue: (role: string) => void;
  isUpdatingRole: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedUser,
  newRoleValue,
  setNewRoleValue,
  isUpdatingRole,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for user {selectedUser?.email}
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
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
  );
};

export default RoleChangeDialog;
