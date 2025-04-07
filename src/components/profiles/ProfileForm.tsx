import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onCancel: () => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  children,
  title = "Profile Information",
  description = "Please fill out the form below",
  onCancel,
  onContinue,
  isSubmitting = false,
}) => {
  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px]">{children}</div>
      </CardContent>
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-white text-green-400 hover:bg-green-400 hover:text-white border-green-400 transition-colors duration-300"
        >
          Cancel
        </Button>
        <Button
          onClick={onContinue}
          disabled={isSubmitting}
          className="bg-green-400 text-white hover:bg-white hover:text-green-400 hover:border-green-400 border border-transparent hover:border-green-400 transition-colors duration-300"
        >
          {isSubmitting ? "Processing..." : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
