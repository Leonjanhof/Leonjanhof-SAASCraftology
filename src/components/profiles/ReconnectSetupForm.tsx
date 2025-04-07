import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { cn } from "@/lib/utils";

type ReconnectSetting = "always" | "delayed" | "none";

interface ReconnectSetupFormProps {
  formData: {
    setting: ReconnectSetting;
  };
  setFormData: (data: any) => void;
  onContinue: () => void;
  onCancel: () => void;
  isLastForm?: boolean;
}

const ReconnectSetupForm: React.FC<ReconnectSetupFormProps> = ({
  formData,
  setFormData,
  onContinue,
  onCancel,
  isLastForm = false,
}) => {
  const { setting: selectedSetting } = formData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onContinue();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm
      title="Reconnect setup"
      description="Configure your connection settings"
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
      continueText={isLastForm ? "Save profile" : "Continue"}
    >
      <div className="space-y-4">
        {["always", "delayed", "none"].map((setting) => (
          <div
            key={setting}
            onClick={() =>
              setFormData({ ...formData, setting: setting as ReconnectSetting })
            }
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all",
              "hover:border-green-400/50",
              selectedSetting === setting
                ? "border-green-400 border-dashed"
                : "border-gray-200",
            )}
          >
            <span className="text-green-600 font-medium capitalize">
              {setting === "always"
                ? "Always reconnect"
                : setting === "delayed"
                  ? "Reconnect delayed"
                  : "None"}
            </span>
          </div>
        ))}
      </div>
    </ProfileForm>
  );
};

export default ReconnectSetupForm;
