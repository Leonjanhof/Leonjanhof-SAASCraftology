import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { cn } from "@/lib/utils";

type AFKSetting = "chatting" | "moving" | "none";

interface AFKSetupFormProps {
  formData: {
    setting: AFKSetting;
  };
  setFormData: (data: any) => void;
  onContinue: () => void;
  onCancel: () => void;
}

const AFKSetupForm: React.FC<AFKSetupFormProps> = ({
  onContinue,
  onCancel,
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
      title="AFK setup"
      description="Configure your AFK settings"
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {["chatting", "moving", "none"].map((setting) => (
          <div
            key={setting}
            onClick={() =>
              setFormData({ ...formData, setting: setting as AFKSetting })
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
              {setting}
            </span>
          </div>
        ))}
      </div>
    </ProfileForm>
  );
};

export default AFKSetupForm;
