import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const handleAuthCallback = async () => {
      try {
        // Extract hash from URL if present
        const hash = window.location.hash;
        console.log("Auth callback URL hash:", hash);
        console.log("Full callback URL:", window.location.href);

        // Get the URL hash and handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        console.log("Auth callback successful", data);

        // If we have a session, navigate to dashboard
        if (data.session) {
          console.log("Session found, redirecting to dashboard");
          console.log("Session user:", data.session.user);

          // Check if component is still mounted before navigating
          if (isMounted) {
            // Use a more reliable approach without setTimeout
            navigate("/dashboard", { replace: true });
          }
        } else {
          console.log("No session found after OAuth callback");
          if (isMounted) {
            setError("No session was created. Please try again.");
          }
        }
      } catch (err: any) {
        console.error("Error in auth callback:", err);
        if (isMounted) {
          setError(err.message || "Authentication failed");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    handleAuthCallback();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  // This will only show briefly before the useEffect redirects
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
