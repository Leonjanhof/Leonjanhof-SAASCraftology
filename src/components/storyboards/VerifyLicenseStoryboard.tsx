import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../../supabase/supabase";

export default function VerifyLicenseStoryboard() {
  const [licenseKey, setLicenseKey] = useState("");
  const [hwid, setHwid] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!licenseKey) {
      setError("License key is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Use the correct URL format for Supabase Edge Functions
      const { data, error } = await supabase.functions.invoke(
        "verify-license",
        {
          body: {
            license_key: licenseKey,
            hwid: hwid || null,
          },
        },
      );

      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error("Error verifying license:", err);
      setError(err.message || "Failed to verify license");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>License Verification Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">License Key</label>
            <Input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter license key"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">HWID (Optional)</label>
            <Input
              value={hwid}
              onChange={(e) => setHwid(e.target.value)}
              placeholder="Enter hardware ID"
              className="w-full"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-green-400 text-white hover:text-green-400 relative overflow-hidden group"
          >
            <span className="relative z-10 transition-colors duration-300">
              {loading ? "Verifying..." : "Verify License"}
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
              <p className="font-medium mb-2">Verification Result:</p>
              <pre className="text-xs overflow-auto p-2 bg-white rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <p className="text-sm font-medium mb-1">How to use the API:</p>
            <p className="text-xs">POST to: /functions/v1/verify-license</p>
            <p className="text-xs">
              Body: {`{ "license_key": "YOUR_KEY", "hwid": "OPTIONAL_HWID" }`}
            </p>
            <p className="text-xs mt-1">Headers:</p>
            <p className="text-xs">{`Content-Type: application/json`}</p>
            <p className="text-xs">{`Authorization: Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
