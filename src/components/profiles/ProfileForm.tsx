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
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onCancel: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
  continueText?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  children,
  title = "Profile Information",
  description = "Please fill out the form below",
  onCancel,
  onContinue,
  onSkip,
  isSubmitting = false,
  continueText = "Continue",
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
      <CardFooter className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-white text-green-400 hover:bg-green-400 hover:text-white border-green-400 transition-colors duration-300"
        >
          Cancel
        </Button>
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
            className="bg-white text-green-400 hover:bg-green-400 hover:text-white border-green-400 transition-colors duration-300"
          >
            Skip
          </Button>
        )}
        <Button
          onClick={onContinue}
          disabled={isSubmitting}
          className="bg-green-400 text-white hover:bg-white hover:text-green-400 hover:border-green-400 border border-transparent hover:border-green-400 transition-colors duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            continueText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
