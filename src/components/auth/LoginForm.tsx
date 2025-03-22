import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { LogIn } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

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

  const handleDiscordSignIn = async () => {
    try {
      setIsLoading(true);
      // Get the next parameter from the URL if it exists
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || '/dashboard';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          scopes: 'identify email',
          queryParams: {
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw error;
      }

      // Check if we got the OAuth URL back and redirect to it
      if (data?.url) {
        // Redirect to the Discord OAuth URL
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned from Supabase');
      }
      
    } catch (error: any) {
      console.error("Discord login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not sign in with Discord. Please try again.",
        variant: "destructive",
      });
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
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-black flex items-center justify-center gap-2"
              onClick={handleDiscordSignIn}
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#5865F2]"
              >
                <path
                  d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.94-1.89-2.1s.84-2.1 1.89-2.1c1.06 0 1.9.94 1.89 2.1 0 1.16-.84 2.1-1.89 2.1zm6.97 0c-1.03 0-1.89-.94-1.89-2.1s.84-2.1 1.89-2.1c1.06 0 1.9.94 1.89 2.1 0 1.16-.83 2.1-1.89 2.1z"
                  fill="currentColor"
                />
              </svg>
              Continue with Discord
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

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
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
