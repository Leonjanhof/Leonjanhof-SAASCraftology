import React, { useState } from "react";
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

interface InitialProfileSetupFormProps {
  onContinue: () => void;
  onCancel: () => void;
}

const InitialProfileSetupForm: React.FC<InitialProfileSetupFormProps> = ({
  onContinue,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    profileName: "",
    serverAddress: "",
    protocol: "auto",
    mode: "voting",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user makes a selection
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.profileName.trim()) {
      setError("Please enter a profile name");
      return false;
    }
    if (!formData.serverAddress.trim()) {
      setError("Please enter a server address");
      return false;
    }
    if (!formData.protocol) {
      setError("Please select a protocol");
      return false;
    }
    if (!formData.mode) {
      setError("Please select a mode");
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onContinue();
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm
      title="Initial profile setup"
      description="Configure your profile settings"
      onCancel={onCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {error && <FormMessage type="error" message={error} className="mb-4" />}

        {/* Profile Name */}
        <div className="space-y-2">
          <Label htmlFor="profileName">Profile name</Label>
          <Input
            id="profileName"
            name="profileName"
            placeholder="Enter profile name"
            value={formData.profileName}
            onChange={handleInputChange}
            className="text-green-600 focus-visible:ring-green-400 placeholder:text-green-600/50"
          />
        </div>

        {/* Server Address */}
        <div className="space-y-2">
          <Label htmlFor="serverAddress">Server address</Label>
          <div className="relative">
            <Input
              id="serverAddress"
              name="serverAddress"
              placeholder="Enter server address"
              value={formData.serverAddress}
              onChange={handleInputChange}
              className="text-green-600 focus-visible:ring-green-400 placeholder:text-green-600/50 pr-[72px]"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
              <span className="text-sm px-2 py-1 bg-gray-100 rounded text-green-600 mr-2">
                :25565
              </span>
            </div>
          </div>
        </div>

        {/* Protocol Selection */}
        <div className="space-y-2">
          <Label htmlFor="protocol">Select protocol</Label>
          <Select
            value={formData.protocol}
            onValueChange={(value) => handleSelectChange("protocol", value)}
          >
            <SelectTrigger className="w-full focus:ring-green-400 text-green-600">
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

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label htmlFor="mode">Select mode</Label>
          <Select
            value={formData.mode}
            onValueChange={(value) => handleSelectChange("mode", value)}
          >
            <SelectTrigger className="w-full focus:ring-green-400 text-green-600">
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
                value="voting-hosting"
                className="text-green-600 hover:text-green-600"
              >
                Voting & hosting
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ProfileForm>
  );
};

export default InitialProfileSetupForm;
