import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AccountsFormData } from "@/lib/hooks/useProfileFormState";
import { openMicrosoftLogin } from "@/lib/auth/microsoft";
import MicrosoftAccountRow from "./MicrosoftAccountRow";
import { toast } from "@/components/ui/use-toast";

interface AccountsSetupFormProps {
  formData: AccountsFormData;
  setFormData: (data: AccountsFormData) => void;
  onContinue: () => void;
  onCancel: () => void;
  onSkip: () => void;
  isVotingMode?: boolean;
}

const AccountsSetupForm: React.FC<AccountsSetupFormProps> = ({
  formData,
  setFormData,
  onContinue,
  onCancel,
  onSkip,
  isVotingMode = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const handleAddAccount = async () => {
    try {
      setIsAddingAccount(true);
      console.log("Opening Microsoft login...");
      const account = await openMicrosoftLogin();
      console.log("Microsoft login result:", account);

      if (account) {
        // Check if account already exists
        const accountExists = formData.accounts.some(
          (acc) => acc.id === account.id,
        );

        if (accountExists) {
          toast({
            title: "Account already exists",
            description: "This Microsoft account has already been added.",
            variant: "destructive",
          });
          return;
        }

        const newFormData = {
          ...formData,
          accounts: [
            ...formData.accounts,
            {
              id: account.id,
              username: account.username,
              accessToken: account.accessToken,
              refreshToken: account.refreshToken,
              expiresAt: account.expiresAt,
            },
          ],
        };
        setFormData(newFormData);
        // Save to localStorage
        localStorage.setItem("profile_accounts", JSON.stringify(newFormData));

        toast({
          title: "Account added",
          description: `Successfully added ${account.username} to your profile.`,
        });
      } else {
        console.log("No account returned from Microsoft login");
        toast({
          title: "Authentication failed",
          description:
            "Failed to authenticate with Microsoft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding Microsoft account:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding your Microsoft account.",
        variant: "destructive",
      });
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleRemoveAccount = (id: string) => {
    const updatedAccounts = formData.accounts.filter((acc) => acc.id !== id);
    const newFormData = {
      ...formData,
      accounts: updatedAccounts,
    };
    setFormData(newFormData);
    // Update localStorage
    localStorage.setItem("profile_accounts", JSON.stringify(newFormData));

    toast({
      title: "Account removed",
      description: "The account has been removed from your profile.",
    });
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
      onSkip={isVotingMode ? undefined : onSkip}
      isSubmitting={isSubmitting}
      continueText={isVotingMode ? "Save profile" : "Continue"}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-green-400 hover:border-green-400 hover:bg-green-400/10"
                disabled={isAddingAccount}
              >
                {isAddingAccount ? (
                  <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 text-green-400" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleAddAccount}
                className="text-green-600 focus:text-green-600 focus:bg-green-50"
                disabled={isAddingAccount}
              >
                Microsoft account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {formData.accounts.length > 0 ? (
            formData.accounts.map((account) => (
              <MicrosoftAccountRow
                key={account.id}
                id={account.id}
                username={account.username}
                onRemove={handleRemoveAccount}
              />
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
