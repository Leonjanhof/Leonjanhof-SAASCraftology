import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../../supabase/supabase";

export default function ProtectedEndpointStoryboard() {
  const [token, setToken] = useState("");
  const [requestBody, setRequestBody] = useState("{}");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!token) {
      setError("Token is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Parse the request body
      const parsedBody = JSON.parse(requestBody);

      // Call the protected endpoint
      const { data, error: functionError } = await supabase.functions.invoke(
        "protected-endpoint",
        {
          body: parsedBody,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (functionError) throw functionError;
      const response = { json: () => Promise.resolve(data) };

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Error calling protected endpoint:", err);
      setError(err.message || "Failed to call protected endpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Protected Endpoint Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Token</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification token"
              className="w-full font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Request Body (JSON)</label>
            <Textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full font-mono text-xs min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-400 text-white hover:text-green-400 relative overflow-hidden group"
          >
            <span className="relative z-10 transition-colors duration-300">
              {loading ? "Sending..." : "Send Request"}
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-3 bg-green-50 text-green-800 rounded-md">
              <p className="font-medium mb-2">Response:</p>
              <pre className="text-xs overflow-auto p-2 bg-white rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <p className="text-sm font-medium mb-1">How to use:</p>
            <ol className="text-xs list-decimal pl-4 space-y-1">
              <li>First verify a license using the verify-license endpoint</li>
              <li>Copy the token from the successful response</li>
              <li>Paste the token in the field above</li>
              <li>Add any JSON request body if needed</li>
              <li>Send the request to test the protected endpoint</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
