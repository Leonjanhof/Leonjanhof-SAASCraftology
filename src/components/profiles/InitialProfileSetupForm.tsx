import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InitialProfileSetupForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    profileName: "",
    serverAddress: "",
    protocol: "auto",
    mode: "voting",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/profiles");
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Navigate back to profiles page after successful creation
      navigate("/profiles");
    } catch (err) {
      console.error("Error creating profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm
      title="Initial profile setup"
      description="Configure your profile settings"
      onCancel={handleCancel}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {/* Profile Name */}
        <div className="space-y-2">
          <Label htmlFor="profileName">Profile Name</Label>
          <Input
            id="profileName"
            name="profileName"
            placeholder="Enter profile name"
            value={formData.profileName}
            onChange={handleInputChange}
            className="focus-visible:ring-green-400 text-green-600"
          />
        </div>

        {/* Server Address */}
        <div className="space-y-2">
          <Label htmlFor="serverAddress">Server Address</Label>
          <div className="relative">
            <Input
              id="serverAddress"
              name="serverAddress"
              placeholder="Enter server address"
              value={formData.serverAddress}
              onChange={handleInputChange}
              className="focus-visible:ring-green-400 pr-20 text-green-600"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm px-2 py-1 bg-gray-100 rounded-md font-mono text-green-600">
              :25565
            </span>
          </div>
        </div>

        {/* Protocol Selection */}
        <div className="space-y-2">
          <Label htmlFor="protocol">Select Protocol</Label>
          <Select
            value={formData.protocol}
            onValueChange={(value) => handleSelectChange("protocol", value)}
          >
            <SelectTrigger className="w-full focus:ring-green-400 text-green-600">
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" className="text-green-600">
                Auto-protocol
              </SelectItem>
              <SelectItem value="1.7.9" className="text-green-600">
                1.7.9
              </SelectItem>
              <SelectItem value="1.8" className="text-green-600">
                1.8
              </SelectItem>
              <SelectItem value="1.9" className="text-green-600">
                1.9
              </SelectItem>
              <SelectItem value="1.10" className="text-green-600">
                1.10
              </SelectItem>
              <SelectItem value="1.11" className="text-green-600">
                1.11
              </SelectItem>
              <SelectItem value="1.12" className="text-green-600">
                1.12
              </SelectItem>
              <SelectItem value="1.13" className="text-green-600">
                1.13
              </SelectItem>
              <SelectItem value="1.14" className="text-green-600">
                1.14
              </SelectItem>
              <SelectItem value="1.15" className="text-green-600">
                1.15
              </SelectItem>
              <SelectItem value="1.16" className="text-green-600">
                1.16
              </SelectItem>
              <SelectItem value="1.17" className="text-green-600">
                1.17
              </SelectItem>
              <SelectItem value="1.18" className="text-green-600">
                1.18
              </SelectItem>
              <SelectItem value="1.19" className="text-green-600">
                1.19
              </SelectItem>
              <SelectItem value="1.20" className="text-green-600">
                1.20
              </SelectItem>
              <SelectItem value="1.21" className="text-green-600">
                1.21
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label htmlFor="mode">Select Mode</Label>
          <Select
            value={formData.mode}
            onValueChange={(value) => handleSelectChange("mode", value)}
          >
            <SelectTrigger className="w-full focus:ring-green-400 text-green-600">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="voting" className="text-green-600">
                Voting
              </SelectItem>
              <SelectItem value="voting-hosting" className="text-green-600">
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
