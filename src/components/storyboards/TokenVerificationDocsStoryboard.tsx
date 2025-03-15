import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../../../supabase/supabase";

export default function TokenVerificationDocsStoryboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Token Verification Documentation
        </h1>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Token Verification System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                  <p className="text-gray-700 mb-4">
                    Our license verification system uses stateless tokens with a
                    1-hour expiration time. These tokens are generated when a
                    license is successfully verified and can be used to access
                    protected endpoints without re-verifying the license for
                    each request.
                  </p>

                  <h4 className="text-md font-semibold mb-2">Token Flow:</h4>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>
                      Client verifies license using the{" "}
                      <code>verify-license</code> endpoint
                    </li>
                    <li>
                      Server validates the license and returns a token if valid
                    </li>
                    <li>
                      Client stores the token (typically in memory or session
                      storage)
                    </li>
                    <li>
                      Client includes the token in subsequent API requests
                    </li>
                    <li>
                      Protected endpoints verify the token before processing the
                      request
                    </li>
                  </ol>

                  <h4 className="text-md font-semibold mb-2">
                    Token Structure:
                  </h4>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`{
  "license_id": "uuid-of-the-license",
  "product_name": "Product Name",
  "user_id": "uuid-of-the-user",
  "exp": 1234567890 // Unix timestamp (seconds since epoch)
}`}
                  </pre>

                  <h4 className="text-md font-semibold mb-2">
                    Security Considerations:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tokens expire after 1 hour for security</li>
                    <li>Tokens are bound to specific products and licenses</li>
                    <li>Tokens should be transmitted securely (HTTPS)</li>
                    <li>
                      Tokens should not be stored in localStorage for security
                      reasons
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Using Tokens with Protected Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 1: Obtain a Token
                  </h3>
                  <p className="text-gray-700 mb-2">
                    First, verify a license to obtain a token:
                  </p>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Example using fetch API
const response = await fetch(
  \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-license\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${ANON_KEY}\`
    },
    body: JSON.stringify({
      license_key: "YOUR_LICENSE_KEY",
      hwid: "OPTIONAL_HARDWARE_ID"
    })
  }
);

const result = await response.json();
const token = result.token; // Store this token securely`}
                  </pre>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 2: Use the Token with Protected Endpoints
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Include the token in the Authorization header for protected
                    requests:
                  </p>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Example using fetch API
const response = await fetch(
  \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protected-endpoint\`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${token}\` // Use the token from step 1
    },
    body: JSON.stringify({
      // Your request data here
    })
  }
);

const result = await response.json();`}
                  </pre>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 3: Handle Token Expiration
                  </h3>
                  <p className="text-gray-700 mb-2">
                    If a token expires (after 1 hour), you'll need to re-verify
                    the license to get a new token:
                  </p>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Example error handling
try {
  const response = await callProtectedEndpoint(token);
  // Process successful response
} catch (error) {
  if (error.status === 401) {
    // Token expired or invalid
    const newToken = await reverifyLicense();
    // Retry with new token
    const retryResponse = await callProtectedEndpoint(newToken);
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Example: Complete License Verification Flow
                  </h3>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Complete example with error handling
async function verifyLicenseAndUseApi(licenseKey, hwid) {
  try {
    // Step 1: Verify license and get token
    const verifyResponse = await fetch(
      \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-license\`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${ANON_KEY}\`
        },
        body: JSON.stringify({ license_key: licenseKey, hwid })
      }
    );
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      throw new Error(errorData.message || "License verification failed");
    }
    
    const verifyResult = await verifyResponse.json();
    const token = verifyResult.token;
    
    // Step 2: Use the token with a protected endpoint
    const apiResponse = await fetch(
      \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protected-endpoint\`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${token}\`
        },
        body: JSON.stringify({ /* your data */ })
      }
    );
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.message || "API request failed");
    }
    
    return await apiResponse.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}`}
                  </pre>

                  <h3 className="text-lg font-semibold mb-2">
                    Example: Using with React
                  </h3>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// React component example
import { useState, useEffect } from 'react';

function LicensedFeature({ licenseKey }) {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Verify license on component mount
  useEffect(() => {
    async function verifyLicense() {
      setLoading(true);
      try {
        const response = await fetch(
          \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-license\`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": \`Bearer \${ANON_KEY}\`
            },
            body: JSON.stringify({ license_key: licenseKey })
          }
        );
        
        const result = await response.json();
        if (result.valid) {
          setToken(result.token);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (licenseKey) {
      verifyLicense();
    }
  }, [licenseKey]);
  
  // Use the protected API with the token
  async function fetchProtectedData() {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protected-endpoint\`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": \`Bearer \${token}\`
          },
          body: JSON.stringify({})
        }
      );
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!token) return <div>Please enter a valid license key</div>;
  
  return (
    <div>
      <p>License verified successfully!</p>
      <button onClick={fetchProtectedData}>Fetch Protected Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
