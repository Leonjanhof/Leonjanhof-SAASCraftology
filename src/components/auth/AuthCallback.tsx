import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // The actual auth callback handling is done in the AuthProvider
    // This component just shows a loading state and redirects after the auth is handled
    const checkAuthStatus = async () => {
      try {
        await refreshSession();
        navigate("/dashboard");
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate("/login");
      }
    };

    checkAuthStatus();
  }, [navigate, refreshSession]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Verifying your account...</h2>
        <p className="text-gray-500">Please wait while we complete the process.</p>
      </div>
    </div>
  );
} 