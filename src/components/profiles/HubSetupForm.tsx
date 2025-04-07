import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import { cn } from "@/lib/utils";

type HubSetting = "command" | "compass" | "none";

interface HubSetupFormProps {
  onContinue: () => void;
  onCancel: () => void;
}

const HubSetupForm: React.FC<HubSetupFormProps> = ({
  onContinue,
  onCancel,
}) => {
  const [selectedSetting, setSelectedSetting] = useState<HubSetting>("none");
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
      title="Hub setup"
      description="Configure your hub settings"
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {["command", "compass", "none"].map((setting) => (
          <div
            key={setting}
            onClick={() => setSelectedSetting(setting as HubSetting)}
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

export default HubSetupForm;
