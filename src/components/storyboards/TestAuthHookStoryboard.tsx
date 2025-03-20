import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AuthHookTestResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  auth?: {
    role: string;
    app_metadata: any;
  };
  database?: {
    role: string;
    permissions: string[];
  };
  isHookWorking?: boolean;
  message?: string;
}

export default function TestAuthHookStoryboard() {
  const { user } = useAuth();
  const [result, setResult] = useState<AuthHookTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAuthHook = async () => {
    if (!user) {
      setError("You must be logged in to test the auth hook");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("test-auth-hook");

      if (error) {
        throw error;
      }

      setResult(data);
    } catch (err: any) {
      console.error("Error testing auth hook:", err);
      setError(err.message || "Failed to test auth hook");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Hook Test</h1>
        <p className="mb-6 text-gray-600">
          This tool tests if your JWT auth hook is working correctly by
          comparing the role in your JWT token with the role in the database.
        </p>

        <Button
          onClick={testAuthHook}
          disabled={loading || !user}
          className="mb-8"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Auth Hook"
          )}
        </Button>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <Card
              className={
                result.isHookWorking ? "border-green-500" : "border-red-500"
              }
            >
              <CardHeader>
                <CardTitle
                  className={
                    result.isHookWorking ? "text-green-600" : "text-red-600"
                  }
                >
                  {result.isHookWorking
                    ? "✅ Auth Hook is Working Correctly"
                    : "❌ Auth Hook is NOT Working Correctly"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {result.isHookWorking
                    ? "The role in your JWT token matches the role in the database."
                    : "The role in your JWT token does not match the role in the database."}
                </p>
                {!result.isHookWorking && (
                  <div className="p-4 bg-red-50 rounded-md">
                    <p className="font-medium">Possible issues:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>The auth.jwt() function is not set up correctly</li>
                      <li>The trigger on auth.jwt table is missing</li>
                      <li>
                        You need to sign out and sign back in to get a new token
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JWT Token Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Role in JWT:</h3>
                      <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1">
                        {result.auth?.role || "Not found"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">App Metadata:</h3>
                      <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-sm">
                        {JSON.stringify(
                          result.auth?.app_metadata || {},
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Role in Database:</h3>
                      <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1">
                        {result.database?.role || "Not found"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Permissions:</h3>
                      <ul className="bg-gray-100 p-2 rounded mt-1">
                        {result.database?.permissions?.length ? (
                          result.database.permissions.map(
                            (permission, index) => (
                              <li key={index} className="font-mono text-sm">
                                {permission}
                              </li>
                            ),
                          )
                        ) : (
                          <li className="text-gray-500">
                            No permissions found
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
            You must be logged in to test the auth hook.
          </div>
        )}
      </div>
    </div>
  );
}
