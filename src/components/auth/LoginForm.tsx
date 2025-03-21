import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { LogIn } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastEmailUsed, setLastEmailUsed] = useState("");
  const { signIn, refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const confirmed = params.get("confirmed") === "true";
      const error = params.get("error");
      const error_description = params.get("error_description");

      if (error) {
        console.error("Auth error:", error, error_description);
        toast({
          title: "Authentication Error",
          description: error_description || "An error occurred during authentication",
          variant: "destructive",
        });
        return;
      }

      if (confirmed) {
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed. You can now sign in.",
          variant: "default",
        });
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthCallback();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLastEmailUsed(email);

    try {
      await signIn(email, password);
      await refreshSession(); // Ensure we have the latest user data
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message);
      
      // Handle specific error cases
      if (error.message === "Email not confirmed") {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email and confirm your account before signing in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!lastEmailUsed) {
      setError("Please enter your email address first");
      return;
    }

    try {
      setResendingEmail(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: lastEmailUsed,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "Confirmation Email Sent",
        description: "Please check your inbox for the confirmation email.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error resending confirmation:", error);
      toast({
        title: "Failed to Resend",
        description: "Could not resend confirmation email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" /> Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error === "Email not confirmed" && (
              <div className="space-y-2">
                <p className="text-sm text-red-500">
                  Please confirm your email address to sign in.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={resendingEmail}
                  onClick={handleResendConfirmation}
                >
                  {resendingEmail ? "Sending..." : "Resend confirmation email"}
                </Button>
              </div>
            )}
            {error && error !== "Email not confirmed" && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
