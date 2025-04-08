import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AccountsFormData } from "@/lib/hooks/useProfileFormState";

interface AccountsSetupFormProps {
  formData: AccountsFormData;
  setFormData: (data: AccountsFormData) => void;
  onContinue: () => void;
  onCancel: () => void;
  onSkip: () => void;
}

const AccountsSetupForm: React.FC<AccountsSetupFormProps> = ({
  formData,
  setFormData,
  onContinue,
  onCancel,
  onSkip,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAccount = () => {
    console.log("Add Microsoft account clicked");
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onContinue();
    } catch (err) {
      console.error("Error saving accounts:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm
      title="Accounts setup"
      description="Manage and add accounts"
      onCancel={onCancel}
      onContinue={handleContinue}
      onSkip={formData.accounts?.mode === "voting" ? undefined : onSkip}
      isSubmitting={isSubmitting}
      continueText={
        formData.accounts?.mode === "voting" ? "Save profile" : "Continue"
      }
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-green-400 hover:border-green-400 hover:bg-green-400/10"
              >
                <Plus className="h-4 w-4 text-green-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleAddAccount}
                className="text-green-600 focus:text-green-600 focus:bg-green-50"
              >
                Microsoft account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {formData.accounts.length > 0 ? (
            formData.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200"
              >
                <div className="h-8 w-8 rounded-lg bg-gray-100" />
                <span className="text-green-600">{account.username}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No accounts added yet
            </div>
          )}
        </div>
      </div>
    </ProfileForm>
  );
};

export default AccountsSetupForm;
