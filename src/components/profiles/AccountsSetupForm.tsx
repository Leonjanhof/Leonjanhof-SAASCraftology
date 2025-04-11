import React, { useState, useEffect } from "react";
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
import { getMicrosoftAccounts } from "@/lib/api/profiles";

interface AccountsSetupFormProps {
  formData: AccountsFormData;
  setFormData: (data: AccountsFormData) => void;
  onContinue: () => void;
  onCancel: () => void;
  onSkip?: () => void;
  isVotingMode?: boolean;
  profileId?: string;
}

const AccountsSetupForm: React.FC<AccountsSetupFormProps> = ({
  formData,
  setFormData,
  onContinue,
  onCancel,
  onSkip,
  isVotingMode = false,
  profileId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing accounts if editing a profile
  useEffect(() => {
    const loadAccounts = async () => {
      if (!profileId) return;

      setIsLoading(true);
      try {
        const { data, error } = await getMicrosoftAccounts(profileId);
        if (error) throw error;

        if (data && data.length > 0) {
          setFormData({
            ...formData,
            accounts: data.map((acc) => ({
              id: acc.id,
              username: acc.username,
              refreshToken: acc.microsoft_refresh_token,
              expiresAt: acc.token_expires_at
                ? new Date(acc.token_expires_at).getTime()
                : undefined,
            })),
            profileId,
          });
        }
      } catch (error) {
        console.error("Error loading Microsoft accounts:", error);
        toast({
          title: "Error",
          description: "Failed to load Microsoft accounts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [profileId, setFormData]);

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
          profileId: formData.profileId || profileId,
        };
        setFormData(newFormData);

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

    toast({
      title: "Account removed",
      description: "The account has been removed from your profile.",
    });
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);

      // Validate that at least one account is added for voting profiles
      if (isVotingMode && formData.accounts.length === 0) {
        toast({
          title: "No accounts added",
          description:
            "You need to add at least one Microsoft account for a voting profile.",
          variant: "destructive",
        });
        return;
      }

      onContinue();
    } catch (err) {
      console.error("Error saving accounts:", err);
      toast({
        title: "Error",
        description: "An error occurred while saving accounts.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProfileForm
        title="Accounts setup"
        description="Loading accounts..."
        onCancel={onCancel}
        onContinue={() => {}}
        isSubmitting={true}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
        </div>
      </ProfileForm>
    );
  }

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
