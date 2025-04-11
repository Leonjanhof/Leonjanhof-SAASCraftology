import React, { useState, useEffect } from "react";
import ProfileForm from "./ProfileForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormMessage from "@/components/ui/form-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InitialFormData } from "@/lib/hooks/useProfileFormState";

interface InitialProfileSetupFormProps {
  formData: InitialFormData;
  setFormData: (data: InitialFormData) => void;
  onContinue: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface ValidationErrors {
  profileName?: string;
  serverAddress?: string;
  protocol?: string;
  mode?: string;
  general?: string;
}

const InitialProfileSetupForm: React.FC<InitialProfileSetupFormProps> = ({
  formData,
  setFormData,
  onContinue,
  onCancel,
  isEditing = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Clear errors when component mounts or when editing status changes
  useEffect(() => {
    setErrors({});
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific error when field is changed
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });

    // Clear specific error when field is changed
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateServerAddress = (address: string): boolean => {
    // Basic validation for server address
    // Allow hostnames, IP addresses, and optional port numbers
    const serverRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z0-9-_.]+$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$/;
    return serverRegex.test(address) || address.toLowerCase() === "localhost";
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate profile name
    if (!formData.profileName.trim()) {
      newErrors.profileName = "Profile name is required";
      isValid = false;
    } else if (formData.profileName.length > 50) {
      newErrors.profileName = "Profile name must be less than 50 characters";
      isValid = false;
    }

    // Validate server address
    if (!formData.serverAddress.trim()) {
      newErrors.serverAddress = "Server address is required";
      isValid = false;
    } else if (!validateServerAddress(formData.serverAddress)) {
      newErrors.serverAddress =
        "Please enter a valid server address (hostname or IP)";
      isValid = false;
    }

    // Validate protocol
    if (!formData.protocol) {
      newErrors.protocol = "Protocol selection is required";
      isValid = false;
    }

    // Validate mode
    if (!formData.mode) {
      newErrors.mode = "Mode selection is required";
      isValid = false;
    } else if (formData.mode !== "voting" && formData.mode !== "hosting") {
      newErrors.mode = "Invalid mode selected";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // Remove artificial delay for better UX
      onContinue();
    } catch (err) {
      console.error("Error processing profile data:", err);
      setErrors({
        general: "Failed to process profile data. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm
      title={isEditing ? "Edit profile" : "Initial profile setup"}
      description={
        isEditing
          ? "Update your profile settings"
          : "Configure your profile settings"
      }
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {errors.general && (
          <FormMessage type="error" message={errors.general} className="mb-4" />
        )}

        <div className="space-y-2">
          <Label htmlFor="profileName" className="flex justify-between">
            <span>Profile name</span>
            <span className="text-xs text-red-500">
              {errors.profileName ? errors.profileName : ""}
            </span>
          </Label>
          <Input
            id="profileName"
            name="profileName"
            placeholder="Enter profile name"
            value={formData.profileName}
            onChange={handleInputChange}
            className={`text-green-600 focus-visible:ring-green-400 placeholder:text-green-600/50 ${errors.profileName ? "border-red-500" : ""}`}
            aria-invalid={!!errors.profileName}
            aria-describedby={
              errors.profileName ? "profileName-error" : undefined
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serverAddress" className="flex justify-between">
            <span>Server address</span>
            <span className="text-xs text-red-500">
              {errors.serverAddress ? errors.serverAddress : ""}
            </span>
          </Label>
          <div className="relative">
            <Input
              id="serverAddress"
              name="serverAddress"
              placeholder="Enter server address (e.g., mc.example.com)"
              value={formData.serverAddress}
              onChange={handleInputChange}
              className={`text-green-600 focus-visible:ring-green-400 placeholder:text-green-600/50 pr-[72px] ${errors.serverAddress ? "border-red-500" : ""}`}
              aria-invalid={!!errors.serverAddress}
              aria-describedby={
                errors.serverAddress ? "serverAddress-error" : undefined
              }
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
              <span className="text-sm px-2 py-1 bg-gray-100 rounded text-green-600 mr-2">
                :25565
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="protocol" className="flex justify-between">
            <span>Select protocol</span>
            <span className="text-xs text-red-500">
              {errors.protocol ? errors.protocol : ""}
            </span>
          </Label>
          <Select
            value={formData.protocol}
            onValueChange={(value) => handleSelectChange("protocol", value)}
          >
            <SelectTrigger
              className={`w-full focus:ring-green-400 text-green-600 ${errors.protocol ? "border-red-500" : ""}`}
              aria-invalid={!!errors.protocol}
              aria-describedby={errors.protocol ? "protocol-error" : undefined}
            >
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="auto"
                className="text-green-600 hover:text-green-600"
              >
                Auto-protocol
              </SelectItem>
              <SelectItem
                value="1.7.9"
                className="text-green-600 hover:text-green-600"
              >
                1.7.9
              </SelectItem>
              <SelectItem
                value="1.8"
                className="text-green-600 hover:text-green-600"
              >
                1.8
              </SelectItem>
              <SelectItem
                value="1.9"
                className="text-green-600 hover:text-green-600"
              >
                1.9
              </SelectItem>
              <SelectItem
                value="1.10"
                className="text-green-600 hover:text-green-600"
              >
                1.10
              </SelectItem>
              <SelectItem
                value="1.11"
                className="text-green-600 hover:text-green-600"
              >
                1.11
              </SelectItem>
              <SelectItem
                value="1.12"
                className="text-green-600 hover:text-green-600"
              >
                1.12
              </SelectItem>
              <SelectItem
                value="1.13"
                className="text-green-600 hover:text-green-600"
              >
                1.13
              </SelectItem>
              <SelectItem
                value="1.14"
                className="text-green-600 hover:text-green-600"
              >
                1.14
              </SelectItem>
              <SelectItem
                value="1.15"
                className="text-green-600 hover:text-green-600"
              >
                1.15
              </SelectItem>
              <SelectItem
                value="1.16"
                className="text-green-600 hover:text-green-600"
              >
                1.16
              </SelectItem>
              <SelectItem
                value="1.17"
                className="text-green-600 hover:text-green-600"
              >
                1.17
              </SelectItem>
              <SelectItem
                value="1.18"
                className="text-green-600 hover:text-green-600"
              >
                1.18
              </SelectItem>
              <SelectItem
                value="1.19"
                className="text-green-600 hover:text-green-600"
              >
                1.19
              </SelectItem>
              <SelectItem
                value="1.20"
                className="text-green-600 hover:text-green-600"
              >
                1.20
              </SelectItem>
              <SelectItem
                value="1.21"
                className="text-green-600 hover:text-green-600"
              >
                1.21
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode" className="flex justify-between">
            <span>Select mode</span>
            <span className="text-xs text-red-500">
              {errors.mode ? errors.mode : ""}
            </span>
          </Label>
          <Select
            value={formData.mode}
            onValueChange={(value) => handleSelectChange("mode", value)}
            disabled={isEditing}
          >
            <SelectTrigger
              className={`w-full focus:ring-green-400 text-green-600 ${errors.mode ? "border-red-500" : ""} ${isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
              aria-invalid={!!errors.mode}
              aria-describedby={errors.mode ? "mode-error" : undefined}
            >
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="voting"
                className="text-green-600 hover:text-green-600"
              >
                Voting
              </SelectItem>
              <SelectItem
                value="hosting"
                className="text-green-600 hover:text-green-600"
              >
                Hosting
              </SelectItem>
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Profile mode cannot be changed after creation
            </p>
          )}
        </div>
      </div>
    </ProfileForm>
  );
};

export default InitialProfileSetupForm;
