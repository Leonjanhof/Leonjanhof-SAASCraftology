import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { UserPlus, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check URL parameters for verification status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified") === "true";
    const confirmed = params.get("confirmed") === "true";

    if (verified || confirmed) {
      setIsVerified(true);
      setIsLoading(false);
      toast({
        title: "Email Verified",
        description: "Your email has been verified. You can now sign in.",
        variant: "default",
      });
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Check if user is already logged in, but don't redirect if verification was just sent
  useEffect(() => {
    if (user && !isVerificationSent) {
      navigate("/dashboard");
    }
  }, [user, navigate, isVerificationSent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !fullName) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName);

      // Set verification sent state first, then show toast
      setIsVerificationSent(true);
      setIsLoading(false); // Ensure loading state is reset

      toast({
        title: "Account Created",
        description:
          "Please check your email to verify your account. You can close this page.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message);

      toast({
        title: "Signup Failed",
        description:
          error.message || "Error creating account. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  if (isVerified) {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Check className="h-5 w-5 text-green-500" /> Email Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-green-600 font-medium">
              Your email has been successfully verified!
            </p>
            <p className="text-sm text-gray-500">
              You can now sign in to your account.
            </p>
            <Button
              onClick={handleLoginRedirect}
              className="w-full bg-green-400 hover:bg-white hover:text-green-400 text-white relative overflow-hidden group"
            >
              <span className="relative z-10 transition-colors duration-300">
                Go to Login
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  if (isVerificationSent) {
    return (
      <AuthLayout>
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" /> Check Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Please check your email (including spam folder) and click the
              verification link.
            </p>
            <p className="text-sm text-gray-500 font-medium">
              You can close this page now and confirm your email.
            </p>
            <Button
              onClick={handleLoginRedirect}
              variant="outline"
              className="mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" /> Create your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input
                id="fullName"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-white hover:text-green-400 text-white relative overflow-hidden group"
              disabled={isLoading}
            >
              <span className="relative z-10 transition-colors duration-300">
                {isLoading ? "Creating account..." : "Create account"}
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <div className="text-center text-sm mt-4">
              <span className="text-gray-500">Already have an account? </span>
              <a
                href="/login"
                className="text-green-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
