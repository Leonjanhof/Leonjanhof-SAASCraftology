import { supabase } from "../supabase";
import { createUserRecord } from "./utils";
import { toast } from "@/components/ui/use-toast";

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
) => {
  try {
    console.log("Starting signup process");

    // Sign up with Supabase Auth
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "user",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?source=email`,
      },
    });

    if (error) throw error;

    console.log("Signup response:", {
      userId: authData.user?.id,
      session: !!authData.session,
      confirmationSent: !authData.session && !!authData.user,
    });

    if (authData.user) {
      await createUserRecord(authData.user.id, email, fullName);

      // Show success message with more details
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your email (including spam folder) to verify your account. The link will redirect you back to complete the signup.",
      });
    }

    return authData;
  } catch (error) {
    console.error("Sign up error:", error);
    toast({
      title: "Signup Failed",
      description:
        error instanceof Error ? error.message : "Failed to create account",
      variant: "destructive",
    });
    throw error instanceof Error ? error : new Error("Failed to sign up");
  }
};
