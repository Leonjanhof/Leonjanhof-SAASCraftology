import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StripeSetupStoryboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Stripe Integration Setup</h1>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">Important</AlertTitle>
          <AlertDescription className="text-amber-700">
            Stripe environment variables need to be set in your Supabase
            project's Edge Functions settings. These are not stored in your
            codebase for security reasons.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="setup">
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            <TabsTrigger value="variables">Environment Variables</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Setting Up Stripe Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 1: Create a Stripe Account
                  </h3>
                  <p className="text-gray-700 mb-4">
                    If you don't already have one, create a Stripe account at{" "}
                    <a
                      href="https://dashboard.stripe.com/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://dashboard.stripe.com/register
                    </a>
                  </p>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 2: Get Your API Keys
                  </h3>
                  <p className="text-gray-700 mb-4">
                    In your Stripe Dashboard, go to Developers → API keys to
                    find your:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Publishable Key (starts with pk_)</li>
                    <li>Secret Key (starts with sk_)</li>
                  </ul>
                  <p className="text-gray-700 mb-4">
                    For testing, use the test mode keys. For production, use the
                    live mode keys.
                  </p>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 3: Set Up Environment Variables
                  </h3>
                  <p className="text-gray-700 mb-4">
                    In your Supabase project dashboard:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>Go to Settings → API</li>
                    <li>Find the "Edge Functions" section</li>
                    <li>
                      Add the following environment variables:
                      <ul className="list-disc pl-5 mt-2">
                        <li>
                          <code>STRIPE_SECRET_KEY</code> - Your Stripe Secret
                          Key
                        </li>
                        <li>
                          <code>STRIPE_WEBHOOK_SECRET</code> - Your Stripe
                          Webhook Secret (from Step 4)
                        </li>
                      </ul>
                    </li>
                  </ol>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 4: Set Up Stripe Products
                  </h3>
                  <p className="text-gray-700 mb-4">
                    In your Stripe Dashboard:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>Go to Products → Add Product</li>
                    <li>
                      Create products that match the ones in your application:
                    </li>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Autovoter</li>
                      <li>Factionsbot 1.18.2</li>
                      <li>EMC captcha solver</li>
                    </ul>
                    <li>
                      For each product, create a price with the appropriate
                      amount and billing interval
                    </li>
                    <li>
                      Note the Price IDs (starting with price_) for each product
                    </li>
                  </ol>

                  <h3 className="text-lg font-semibold mb-2">
                    Step 5: Update Price IDs in Your Code
                  </h3>
                  <p className="text-gray-700 mb-4">
                    In your{" "}
                    <code>src/components/landing/ProductsSection.tsx</code>{" "}
                    file, update the price IDs in the{" "}
                    <code>findPlanIdByProductName</code> function to match your
                    Stripe price IDs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variables">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Required Environment Variables
                  </h3>
                  <p className="text-gray-700 mb-4">
                    These variables need to be set in your Supabase project's
                    Edge Functions settings:
                  </p>

                  <div className="bg-gray-100 p-4 rounded-md mb-6">
                    <h4 className="font-semibold mb-2">Stripe Variables</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-mono text-sm">STRIPE_SECRET_KEY</div>
                      <div className="text-sm">
                        Your Stripe Secret Key (sk_test_... or sk_live_...)
                      </div>

                      <div className="font-mono text-sm">
                        STRIPE_WEBHOOK_SECRET
                      </div>
                      <div className="text-sm">
                        Your Stripe Webhook Secret (whsec_...)
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">
                      Supabase Variables (Already Set)
                    </h4>
                    <p className="text-sm mb-2">
                      These are automatically available in Edge Functions:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-mono text-sm">SUPABASE_URL</div>
                      <div className="text-sm">Your Supabase project URL</div>

                      <div className="font-mono text-sm">
                        SUPABASE_SERVICE_ROLE_KEY
                      </div>
                      <div className="text-sm">
                        Your Supabase service role key
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle>Stripe Webhook Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Setting Up Stripe Webhooks
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Webhooks allow Stripe to notify your application when events
                    happen in your account.
                  </p>

                  <h4 className="text-md font-semibold mb-2">
                    Step 1: Create a Webhook Endpoint
                  </h4>
                  <p className="text-gray-700 mb-4">
                    In your Stripe Dashboard:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>Go to Developers → Webhooks → Add endpoint</li>
                    <li>
                      For the endpoint URL, enter your Supabase Edge Function
                      URL:
                      <div className="bg-gray-100 p-2 rounded my-2 font-mono text-sm break-all">
                        https://[YOUR_PROJECT_ID].supabase.co/functions/v1/payments-webhook
                      </div>
                    </li>
                    <li>
                      For events to send, select:
                      <ul className="list-disc pl-5 mt-2">
                        <li>checkout.session.completed</li>
                        <li>customer.subscription.created</li>
                        <li>customer.subscription.updated</li>
                        <li>customer.subscription.deleted</li>
                        <li>invoice.payment_succeeded</li>
                        <li>invoice.payment_failed</li>
                      </ul>
                    </li>
                    <li>Click "Add endpoint"</li>
                  </ol>

                  <h4 className="text-md font-semibold mb-2">
                    Step 2: Get Your Webhook Secret
                  </h4>
                  <p className="text-gray-700 mb-4">
                    After creating the webhook:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>Click on the webhook you just created</li>
                    <li>Click "Reveal" next to "Signing secret"</li>
                    <li>Copy the signing secret (starts with whsec_)</li>
                    <li>
                      Add this as the STRIPE_WEBHOOK_SECRET environment variable
                      in your Supabase Edge Functions settings
                    </li>
                  </ol>

                  <h4 className="text-md font-semibold mb-2">
                    Step 3: Test the Webhook
                  </h4>
                  <p className="text-gray-700 mb-4">
                    You can test your webhook integration by:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    <li>
                      In the Stripe Dashboard, go to the webhook details page
                    </li>
                    <li>Click "Send test webhook"</li>
                    <li>
                      Select an event type (e.g., checkout.session.completed)
                    </li>
                    <li>Click "Send test webhook"</li>
                    <li>
                      Check your Supabase logs to verify the webhook was
                      received and processed
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
