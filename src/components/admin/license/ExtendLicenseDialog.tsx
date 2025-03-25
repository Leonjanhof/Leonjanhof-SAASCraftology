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
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import { License } from "./types";

interface ExtendLicenseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLicense: License | null;
  expiryDate: Date | undefined;
  setExpiryDate: (date: Date | undefined) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const ExtendLicenseDialog: React.FC<ExtendLicenseDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedLicense,
  expiryDate,
  setExpiryDate,
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Extend License</DialogTitle>
          <DialogDescription>
            Update the expiration date for this license
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {selectedLicense && (
            <div className="space-y-1">
              <Label>License Key</Label>
              <div className="p-2 bg-gray-100 rounded font-mono text-xs">
                {selectedLicense.license_key}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiryDate">New Expiry Date</Label>
            <DatePicker date={expiryDate} setDate={setExpiryDate} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !expiryDate}
            className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <span className="relative z-10 transition-colors duration-300">
                  Update Expiry
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

export default ExtendLicenseDialog;
