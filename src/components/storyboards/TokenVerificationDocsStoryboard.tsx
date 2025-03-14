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
                    {`// POST to verify-license endpoint
const response = await fetch(
  "https://gznlyltalcxjisnunzdm.functions.supabase.co/verify-license",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}"
    },
    body: JSON.stringify({
      license_key: "YOUR_LICENSE_KEY",
      hwid: "OPTIONAL_HARDWARE_ID"
    })
  }
);

const data = await response.json();
// If valid, data will contain a token
const token = data.token; // Store this securely`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 2: Use the Token
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Include the token in the Authorization header for protected
                    endpoints:
                  </p>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Call a protected endpoint
const protectedResponse = await fetch(
  "https://gznlyltalcxjisnunzdm.functions.supabase.co/protected-endpoint",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token // Use the token from step 1
    },
    body: JSON.stringify({
      // Your request data here
    })
  }
);

const protectedData = await protectedResponse.json();`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 3: Handle Token Expiration
                  </h3>
                  <p className="text-gray-700 mb-2">
                    If a token expires (after 1 hour), you'll need to re-verify
                    the license:
                  </p>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// Check for token expiration in the response
if (protectedData.success === false && 
    protectedData.message.includes("expired")) {
  // Re-verify the license to get a new token
  // ... code from Step 1 ...
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
                    Complete JavaScript Example
                  </h3>
                  <pre className="p-3 bg-gray-100 rounded text-sm overflow-auto mb-4">
                    {`// License verification and token usage example

async function verifyLicense(licenseKey, hwid) {
  try {
    const response = await fetch(
      "https://gznlyltalcxjisnunzdm.functions.supabase.co/verify-license",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}"
        },
        body: JSON.stringify({
          license_key: licenseKey,
          hwid: hwid
        })
      }
    );
    
    const data = await response.json();
    
    if (data.valid) {
      // Store the token securely
      sessionStorage.setItem("licenseToken", data.token);
      return {
        success: true,
        token: data.token,
        expiresAt: data.expires_at
      };
    } else {
      return {
        success: false,
        message: data.message || "License verification failed"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during verification"
    };
  }
}

async function callProtectedEndpoint(requestData) {
  try {
    // Get the token from storage
    const token = sessionStorage.getItem("licenseToken");
    
    if (!token) {
      return {
        success: false,
        message: "No valid license token found. Please verify your license."
      };
    }
    
    const response = await fetch(
      "https://gznlyltalcxjisnunzdm.functions.supabase.co/protected-endpoint",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(requestData)
      }
    );
    
    const data = await response.json();
    
    if (!data.success && data.message.includes("expired")) {
      // Token has expired, clear it
      sessionStorage.removeItem("licenseToken");
      
      return {
        success: false,
        message: "Your session has expired. Please verify your license again."
      };
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred"
    };
  }
}

// Usage example
async function example() {
  // Step 1: Verify license
  const verifyResult = await verifyLicense("YOUR-LICENSE-KEY", "YOUR-HWID");
  
  if (!verifyResult.success) {
    console.error("License verification failed:", verifyResult.message);
    return;
  }
  
  console.log("License verified successfully!");
  
  // Step 2: Call protected endpoint
  const protectedResult = await callProtectedEndpoint({
    action: "getData",
    parameters: {
      // Your parameters here
    }
  });
  
  if (protectedResult.success) {
    console.log("Protected endpoint response:", protectedResult.data);
  } else {
    console.error("Protected endpoint error:", protectedResult.message);
  }
}`}
                  </pre>
                </div>

                <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                  <h3 className="font-semibold mb-2">Important Notes</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Always use HTTPS for all API requests</li>
                    <li>
                      In production applications, consider more secure token
                      storage methods
                    </li>
                    <li>
                      Implement proper error handling for network issues and
                      token expiration
                    </li>
                    <li>
                      The token is tied to the specific license and product - it
                      cannot be used for other products
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
