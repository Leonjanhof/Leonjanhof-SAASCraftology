import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Loader2 } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const { refreshSession, user } = useAuth();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The actual auth callback handling is done in the AuthProvider
    // This component adds additional retry logic for OAuth flows
    const checkAuthStatus = async () => {
      try {
        console.log("AuthCallback: Checking auth status...");

        // If we have a hash in the URL, it's likely an OAuth callback
        const hasOAuthParams =
          window.location.hash.includes("access_token") ||
          window.location.search.includes("code=");

        // Wait a moment to ensure any background processes complete
        if (hasOAuthParams) {
          console.log(
            "AuthCallback: OAuth parameters detected, waiting for processing...",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("AuthCallback: Session check result:", !!session);

        if (session?.user) {
          // Verify the user exists in the database
          const { data: userExists, error: userCheckError } = await supabase
            .from("users")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (userCheckError) {
            console.error(
              "AuthCallback: Error checking if user exists:",
              userCheckError,
            );
          }

          if (!userExists && hasOAuthParams) {
            console.log(
              "AuthCallback: User doesn't exist in database, creating record...",
            );

            // Create user record for OAuth login
            try {
              // Extract user information from the session
              const fullName =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.user_metadata?.preferred_username ||
                session.user.email?.split("@")[0] ||
                "User";

              // Create user record
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: fullName,
                  token_identifier: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  avatar_url: session.user.user_metadata?.avatar_url,
                });

              if (insertError) {
                console.error(
                  "AuthCallback: Error creating user record:",
                  insertError,
                );
                throw insertError;
              }

              console.log("AuthCallback: Successfully created user record");

              // Wait for any triggers to complete
              await new Promise((resolve) => setTimeout(resolve, 1500));

              // Verify the user was created
              const { data: verifyUser } = await supabase
                .from("users")
                .select("id")
                .eq("id", session.user.id)
                .single();

              if (!verifyUser) {
                throw new Error("User record creation could not be verified");
              }

              console.log("AuthCallback: User record verified");
            } catch (error) {
              console.error("AuthCallback: Error in user creation:", error);
              throw error;
            }
          }
        }

        // Refresh the session to get the latest data
        await refreshSession();

        // Navigate to dashboard if successful
        console.log(
          "AuthCallback: Authentication successful, redirecting to dashboard",
        );
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("AuthCallback: Error in auth callback:", error);

        // If we've tried less than 3 times, retry
        if (retryCount < 3) {
          console.log(`AuthCallback: Retrying (${retryCount + 1}/3)...`);
          setRetryCount((prev) => prev + 1);
          setTimeout(checkAuthStatus, 1500); // Wait 1.5 seconds before retrying
        } else {
          setError(
            error instanceof Error ? error.message : "Authentication failed",
          );
          toast({
            title: "Authentication Error",
            description:
              "There was a problem signing you in. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    checkAuthStatus();
  }, [navigate, refreshSession, retryCount]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(0); // Reset retry count
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Authentication Error
          </h2>
          <p className="text-gray-700 mb-6">
            We encountered a problem while signing you in. This could be due to
            network issues or a problem with your account.
          </p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleRetry}
              className="bg-green-400 hover:bg-white hover:text-green-400 text-white relative overflow-hidden group"
            >
              <span className="relative z-10 transition-colors duration-300">
                Try Again
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <Button variant="outline" onClick={handleGoToLogin}>
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-400" />
        <h2 className="text-xl font-semibold mb-2">
          Verifying your account...
        </h2>
        <p className="text-gray-500">
          Please wait while we complete the process.
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-amber-600 mt-4">
            Taking longer than expected. Retry attempt {retryCount}/3...
          </p>
        )}
      </div>
    </div>
  );
}
