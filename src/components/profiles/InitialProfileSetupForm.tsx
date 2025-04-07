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
      title="Initial Profile Setup"
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
            className="focus-visible:ring-green-400"
          />
        </div>

        {/* Server Address */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="serverAddress">Server Address</Label>
            <span className="text-sm px-2 py-1 bg-gray-100 rounded-md font-mono">
              :25565
            </span>
          </div>
          <Input
            id="serverAddress"
            name="serverAddress"
            placeholder="Enter server address"
            value={formData.serverAddress}
            onChange={handleInputChange}
            className="focus-visible:ring-green-400"
          />
        </div>

        {/* Protocol Selection */}
        <div className="space-y-2">
          <Label htmlFor="protocol">Select Protocol</Label>
          <Select
            value={formData.protocol}
            onValueChange={(value) => handleSelectChange("protocol", value)}
          >
            <SelectTrigger className="w-full focus:ring-green-400">
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-protocol</SelectItem>
              <SelectItem value="1.7.9">1.7.9</SelectItem>
              <SelectItem value="1.8">1.8</SelectItem>
              <SelectItem value="1.9">1.9</SelectItem>
              <SelectItem value="1.10">1.10</SelectItem>
              <SelectItem value="1.11">1.11</SelectItem>
              <SelectItem value="1.12">1.12</SelectItem>
              <SelectItem value="1.13">1.13</SelectItem>
              <SelectItem value="1.14">1.14</SelectItem>
              <SelectItem value="1.15">1.15</SelectItem>
              <SelectItem value="1.16">1.16</SelectItem>
              <SelectItem value="1.17">1.17</SelectItem>
              <SelectItem value="1.18">1.18</SelectItem>
              <SelectItem value="1.19">1.19</SelectItem>
              <SelectItem value="1.20">1.20</SelectItem>
              <SelectItem value="1.21">1.21</SelectItem>
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
            <SelectTrigger className="w-full focus:ring-green-400">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="voting">Voting</SelectItem>
              <SelectItem value="voting-hosting">Voting & hosting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ProfileForm>
  );
};

export default InitialProfileSetupForm;
