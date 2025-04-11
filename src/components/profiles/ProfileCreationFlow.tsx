import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import InitialProfileSetupForm from "./InitialProfileSetupForm";
import AccountsSetupForm from "./AccountsSetupForm";
import HubSetupForm from "./HubSetupForm";
import AFKSetupForm from "./AFKSetupForm";
import ReconnectSetupForm from "./ReconnectSetupForm";
import { useProfileFormState } from "@/lib/hooks/useProfileFormState";
import { toast } from "@/components/ui/use-toast";

const ProfileCreationFlow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "voting";
  const navigate = useNavigate();

  const {
    initialFormData,
    setInitialFormData,
    accountsFormData,
    setAccountsFormData,
    hubFormData,
    setHubFormData,
    afkFormData,
    setAFKFormData,
    reconnectFormData,
    setReconnectFormData,
    saveProfile,
    loading,
  } = useProfileFormState(id);

  const [step, setStep] = useState(1);

  const handleCancel = () => {
    navigate("/profiles");
  };

  const handleInitialFormContinue = () => {
    // If mode is hosting, skip the accounts step
    if (initialFormData.mode === "hosting") {
      setStep(3); // Go to hub setup
    } else {
      setStep(2); // Go to accounts setup
    }
  };

  const handleAccountsFormContinue = () => {
    setStep(3); // Go to hub setup
  };

  const handleHubFormContinue = () => {
    setStep(4); // Go to AFK setup
  };

  const handleAFKFormContinue = () => {
    setStep(5); // Go to reconnect setup
  };

  const handleReconnectFormContinue = async () => {
    try {
      const result = await saveProfile();
      if (result.success) {
        navigate("/profiles");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const handleSkipToFinal = async () => {
    try {
      const result = await saveProfile();
      if (result.success) {
        navigate("/profiles");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  // Force mode from URL parameter
  if (initialFormData.mode !== mode) {
    setInitialFormData({ ...initialFormData, mode });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {step === 1 && (
        <InitialProfileSetupForm
          formData={initialFormData}
          setFormData={setInitialFormData}
          onContinue={handleInitialFormContinue}
          onCancel={handleCancel}
          isEditing={!!id}
        />
      )}

      {step === 2 && initialFormData.mode === "voting" && (
        <AccountsSetupForm
          formData={accountsFormData}
          setFormData={setAccountsFormData}
          onContinue={handleAccountsFormContinue}
          onCancel={handleCancel}
          onSkip={handleSkipToFinal}
          isVotingMode={true}
          profileId={id || initialFormData.profileId}
        />
      )}

      {step === 3 && (
        <HubSetupForm
          formData={hubFormData}
          setFormData={setHubFormData}
          onContinue={handleHubFormContinue}
          onCancel={handleCancel}
          onSkip={handleSkipToFinal}
        />
      )}

      {step === 4 && (
        <AFKSetupForm
          formData={afkFormData}
          setFormData={setAFKFormData}
          onContinue={handleAFKFormContinue}
          onCancel={handleCancel}
          onSkip={handleSkipToFinal}
        />
      )}

      {step === 5 && (
        <ReconnectSetupForm
          formData={reconnectFormData}
          setFormData={setReconnectFormData}
          onContinue={handleReconnectFormContinue}
          onCancel={handleCancel}
          isSubmitting={loading}
        />
      )}
    </div>
  );
};

export default ProfileCreationFlow;
