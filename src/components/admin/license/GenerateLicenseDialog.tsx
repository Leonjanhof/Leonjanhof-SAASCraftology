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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { LicenseFormData, Product, User } from "./types";

interface GenerateLicenseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: LicenseFormData;
  setFormData: React.Dispatch<React.SetStateAction<LicenseFormData>>;
  selectAllUsers: boolean;
  setSelectAllUsers: (value: boolean) => void;
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  filteredUsers: User[];
  products: Product[];
  loadingUsers: boolean;
  loadingProducts: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  handleSelectChange: (name: string, value: string) => void;
}

const GenerateLicenseDialog: React.FC<GenerateLicenseDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  selectAllUsers,
  setSelectAllUsers,
  userSearchQuery,
  setUserSearchQuery,
  filteredUsers,
  products,
  loadingUsers,
  loadingProducts,
  isSubmitting,
  onSubmit,
  onCancel,
  handleSelectChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate New License</DialogTitle>
          <DialogDescription>
            Create a new license for a user and product
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="selectAllUsers"
                checked={selectAllUsers}
                onCheckedChange={(checked) => {
                  setSelectAllUsers(checked === true);
                  if (checked) {
                    setFormData((prev) => ({ ...prev, userId: "" }));
                  }
                }}
              />
              <Label htmlFor="selectAllUsers" className="cursor-pointer">
                Generate for all users
              </Label>
            </div>

            {!selectAllUsers && (
              <>
                <Label htmlFor="userId">
                  <div className="flex items-center">
                    User
                    {loadingUsers && (
                      <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                    )}
                  </div>
                </Label>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email or name"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={formData.userId}
                  onValueChange={(value) => handleSelectChange("userId", value)}
                  disabled={loadingUsers || selectAllUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email} ({user.full_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filteredUsers.length === 0 && userSearchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    No users found matching your search
                  </p>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">
              <div className="flex items-center">
                Product
                {loadingProducts && (
                  <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                )}
              </div>
            </Label>
            <Select
              value={formData.productName}
              onValueChange={(value) =>
                handleSelectChange("productName", value)
              }
              disabled={loadingProducts}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.name}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <DatePicker
              date={formData.expiryDate}
              setDate={(date) =>
                setFormData((prev) => ({ ...prev, expiryDate: date }))
              }
            />
            <p className="text-xs text-gray-500">
              Leave blank for non-expiring license
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span className="relative z-10 transition-colors duration-300">
                  Generate License
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

export default GenerateLicenseDialog;
