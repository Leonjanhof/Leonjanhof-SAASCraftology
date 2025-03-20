import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { LogIn } from "lucide-react";
import { supabase } from "../../../supabase/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastEmailUsed, setLastEmailUsed] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const confirmed = params.get("confirmed") === "true";
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  useEffect(() => {
    if (access_token && refresh_token) {
      // Set the session with the tokens from the URL
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ data, error }) => {
          if (!error && data.session) {
            // Check if the user's email is verified
            const user = data.session.user;
            if (user && user.email_confirmed_at) {
              console.log("Email verified at:", user.email_confirmed_at);
            }
            navigate("/");
          } else if (error) {
            console.error("Error setting session:", error);
            setError("Failed to authenticate. Please try logging in again.");
          }
        });
    }
  }, [access_token, refresh_token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLastEmailUsed(email);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      // Use the error message directly since we're now properly formatting it in signIn
      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full">
        {confirmed && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Email confirmed! </strong>
            <span className="block sm:inline">You can now sign in.</span>
          </div>
        )}
        {access_token && refresh_token && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Authentication successful! </strong>
            <span className="block sm:inline">Redirecting you...</span>
          </div>
        )}
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
                  onClick={async () => {
                    try {
                      setResendingEmail(true);
                      const { error } = await supabase.auth.resend({
                        type: "signup",
                        email: lastEmailUsed,
                        options: {
                          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
                        },
                      });
                      if (error) throw error;
                      setError(
                        "Confirmation email resent. Please check your inbox.",
                      );
                    } catch (e) {
                      setError(
                        "Failed to resend confirmation email. Please try again.",
                      );
                    } finally {
                      setResendingEmail(false);
                    }
                  }}
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
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
