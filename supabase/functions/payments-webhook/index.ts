import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
type WebhookEvent = {
  event_type: string;
  type: string;
  stripe_event_id: string;
  created_at: string;
  modified_at: string;
  data: any;
};

type SubscriptionData = {
  stripe_id: string;
  user_id: string;
  price_id: string;
  stripe_price_id: string;
  currency: string;
  interval: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  amount: number;
  started_at: number;
  customer_id: string;
  metadata: Record<string, any>;
  canceled_at?: number;
  ended_at?: number;
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Utility functions
async function logAndStoreWebhookEvent(
  supabaseClient: any,
  event: any,
  data: any,
): Promise<void> {
  const { error } = await supabaseClient.from("webhook_events").insert({
    event_type: event.type,
    type: event.type.split(".")[0],
    stripe_event_id: event.id,
    created_at: new Date(event.created * 1000).toISOString(),
    modified_at: new Date(event.created * 1000).toISOString(),
    data,
  } as WebhookEvent);

  if (error) {
    console.error("Error logging webhook event:", error);
    throw error;
  }
}

async function updateSubscriptionStatus(
  supabaseClient: any,
  stripeId: string,
  status: string,
): Promise<void> {
  const { error } = await supabaseClient
    .from("subscriptions")
    .update({ status })
    .eq("stripe_id", stripeId);

  if (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

// Event handlers
async function handleSubscriptionCreated(supabaseClient: any, event: any) {
  const subscription = event.data.object;
  console.log("Handling subscription created:", subscription.id);

  // Try to get user information
  let userId = subscription.metadata?.user_id || subscription.metadata?.userId;
  if (!userId) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const { data: userData } = await supabaseClient
        .from("users")
        .select("id")
        .eq("email", customer.email)
        .single();

      userId = userData?.id;
      if (!userId) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Unable to find associated user:", error);
      return new Response(
        JSON.stringify({ error: "Unable to find associated user" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  // Try to get product name from the subscription items
  let productName = "";
  if (subscription.items?.data?.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    console.log("Price ID from subscription:", priceId);

    // Map price IDs to product names
    const priceToProductMap: Record<string, string> = {
      price_1R1A9uGLqZ8YjU1vEkXXC79n: "Autovoter",
      price_1R1AE1GLqZ8YjU1vUrS3ZSXJ: "Factionsbot 1.18.2",
      price_1R1AETGLqZ8YjU1vkuXGLxKY: "EMC captcha solver",
    };

    productName = priceToProductMap[priceId] || "";
    console.log("Mapped product name:", productName);
  }

  const subscriptionData: SubscriptionData = {
    stripe_id: subscription.id,
    user_id: userId,
    price_id: subscription.items.data[0]?.price.id,
    stripe_price_id: subscription.items.data[0]?.price.id,
    currency: subscription.currency,
    interval: subscription.items.data[0]?.plan.interval,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    amount: subscription.items.data[0]?.plan.amount ?? 0,
    started_at: subscription.start_date ?? Math.floor(Date.now() / 1000),
    customer_id: subscription.customer,
    metadata: {
      ...(subscription.metadata || {}),
      product_name: productName, // Add product name to metadata
    },
    canceled_at: subscription.canceled_at,
    ended_at: subscription.ended_at,
  };

  // First, check if a subscription with this stripe_id already exists
  const { data: existingSubscription } = await supabaseClient
    .from("subscriptions")
    .select("id")
    .eq("stripe_id", subscription.id)
    .maybeSingle();

  // Update subscription in database
  const { error } = await supabaseClient.from("subscriptions").upsert(
    {
      // If we found an existing subscription, use its UUID, otherwise let Supabase generate one
      ...(existingSubscription?.id ? { id: existingSubscription.id } : {}),
      ...subscriptionData,
    },
    {
      // Use stripe_id as the match key for upsert
      onConflict: "stripe_id",
    },
  );

  if (error) {
    console.error("Error creating subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Verify the subscription was created/updated
  const { data: verifySubscription, error: verifyError } = await supabaseClient
    .from("subscriptions")
    .select("id, stripe_id, status")
    .eq("stripe_id", subscription.id)
    .single();

  if (verifyError) {
    console.error("Error verifying subscription creation:", verifyError);
  } else {
    console.log("Subscription verified successfully:", verifySubscription.id);
  }

  return new Response(
    JSON.stringify({ message: "Subscription created successfully" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function handleSubscriptionUpdated(supabaseClient: any, event: any) {
  const subscription = event.data.object;
  console.log("Handling subscription updated:", subscription.id);

  const { error } = await supabaseClient
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
      canceled_at: subscription.canceled_at,
      ended_at: subscription.ended_at,
    })
    .eq("stripe_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({ message: "Subscription updated successfully" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function handleSubscriptionDeleted(supabaseClient: any, event: any) {
  const subscription = event.data.object;
  console.log("Handling subscription deleted:", subscription.id);

  try {
    await updateSubscriptionStatus(supabaseClient, subscription.id, "canceled");

    // If we have email in metadata, update user's subscription status
    if (subscription?.metadata?.email) {
      await supabaseClient
        .from("users")
        .update({ subscription: null })
        .eq("email", subscription.metadata.email);
    }

    return new Response(
      JSON.stringify({ message: "Subscription deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process subscription deletion" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleCheckoutSessionCompleted(supabaseClient: any, event: any) {
  const session = event.data.object;
  console.log("Handling checkout session completed:", session.id);
  console.log("Full session data:", JSON.stringify(session, null, 2));

  // Extract subscription ID - handle both string and object formats
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  console.log("Extracted subscriptionId:", subscriptionId);
  console.log("Session metadata:", JSON.stringify(session.metadata, null, 2));

  // CRITICAL FIX: Even if there's no subscription ID in the session, we should still
  // create a license for one-time purchases. Only return early if this is not a payment
  if (!subscriptionId && !session.payment_intent) {
    console.log(
      "No subscription ID or payment intent found in checkout session",
    );
    return new Response(
      JSON.stringify({
        message: "No subscription or payment in checkout session",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    let stripeSubscription = null;
    let updatedStripeSubscription = null;

    // Only attempt to update the Stripe subscription if we have a subscription ID
    if (subscriptionId) {
      console.log(
        "Attempting to update subscription in Stripe with ID:",
        subscriptionId,
      );
      console.log("Metadata to be added:", {
        ...session.metadata,
        checkoutSessionId: session.id,
      });

      try {
        // Fetch the current subscription from Stripe to get the latest status
        stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        console.log(
          "Retrieved Stripe subscription status:",
          stripeSubscription.status,
        );

        updatedStripeSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            metadata: {
              ...session.metadata,
              checkoutSessionId: session.id,
            },
          },
        );

        console.log(
          "Successfully updated Stripe subscription:",
          updatedStripeSubscription.id,
        );
        console.log(
          "Updated Stripe metadata:",
          JSON.stringify(updatedStripeSubscription.metadata, null, 2),
        );

        console.log(
          "Checking if subscription exists in Supabase with stripe_id:",
          subscriptionId,
        );
      } catch (stripeError) {
        console.error("Error updating Stripe subscription:", stripeError);
        // Continue with license creation even if Stripe update fails
      }
    } else {
      console.log(
        "No subscription ID available, skipping Stripe subscription update",
      );
    }

    const userId = session.metadata?.userId || session.metadata?.user_id;
    if (!userId) {
      console.error("No user ID found in session metadata");
      throw new Error("No user ID found in session metadata");
    }

    // First, check if the subscription already exists in the database
    let existingSubscription = null;
    let checkError = null;

    if (subscriptionId) {
      const result = await supabaseClient
        .from("subscriptions")
        .select("id")
        .eq("stripe_id", subscriptionId)
        .maybeSingle();

      existingSubscription = result.data;
      checkError = result.error;

      console.log(
        "Existing subscription check result:",
        existingSubscription ? "Found" : "Not found",
      );

      if (checkError) {
        console.error("Error checking for existing subscription:", checkError);
      }
    } else {
      console.log("No subscription ID to check, likely a one-time purchase");
    }

    let supabaseResult = null;

    // Only create/update subscription if we have a subscription ID
    if (subscriptionId && stripeSubscription) {
      // Prepare subscription data
      const subscriptionData: SubscriptionData = {
        stripe_id: subscriptionId,
        user_id: userId,
        price_id: stripeSubscription.items.data[0]?.price.id,
        stripe_price_id: stripeSubscription.items.data[0]?.price.id,
        currency: stripeSubscription.currency,
        interval: stripeSubscription.items.data[0]?.plan.interval,
        status: stripeSubscription.status,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        amount: stripeSubscription.items.data[0]?.plan.amount ?? 0,
        started_at:
          stripeSubscription.start_date ?? Math.floor(Date.now() / 1000),
        customer_id: stripeSubscription.customer,
        metadata: {
          ...session.metadata,
          checkoutSessionId: session.id,
          product_name: session.metadata?.product_name || "",
        },
      };

      // If subscription doesn't exist, create it; otherwise, update it
      if (!existingSubscription) {
        console.log(
          "Creating new subscription in Supabase with data:",
          JSON.stringify(subscriptionData),
        );
        supabaseResult = await supabaseClient
          .from("subscriptions")
          .insert(subscriptionData);
      } else {
        console.log("Updating existing subscription in Supabase");
        supabaseResult = await supabaseClient
          .from("subscriptions")
          .update(subscriptionData)
          .eq("stripe_id", subscriptionId);
      }

      console.log(
        "Supabase subscription operation result:",
        JSON.stringify(supabaseResult, null, 2),
      );

      if (supabaseResult.error) {
        console.error(
          "Error with Supabase subscription operation:",
          supabaseResult.error,
        );
        // Don't throw here, continue to create license
        console.log("Continuing to create license despite subscription error");
      }
    } else {
      console.log(
        "No subscription ID available, skipping subscription creation/update",
      );
    }

    // Verify the subscription was created/updated if we have a subscription ID
    if (subscriptionId) {
      const { data: verifySubscription, error: verifySubError } =
        await supabaseClient
          .from("subscriptions")
          .select("id, stripe_id, status, metadata")
          .eq("stripe_id", subscriptionId)
          .single();

      if (verifySubError) {
        console.error("Error verifying subscription:", verifySubError);
      } else if (verifySubscription) {
        console.log(
          "Subscription verified successfully:",
          verifySubscription.id,
        );
        console.log("Subscription metadata:", verifySubscription.metadata);
      } else {
        console.error(
          "Subscription verification failed - no subscription found after creation/update",
        );
      }
    }

    // Get the product name from the line items
    let productName = "";

    // Try to get product name from the subscription items if we have a subscription
    if (subscriptionId && stripeSubscription?.items?.data?.length > 0) {
      const priceId = stripeSubscription.items.data[0].price.id;
      console.log("Price ID from subscription:", priceId);

      // Map price IDs to product names
      const priceToProductMap: Record<string, string> = {
        price_1R1A9uGLqZ8YjU1vEkXXC79n: "Autovoter",
        price_1R1AE1GLqZ8YjU1vUrS3ZSXJ: "Factionsbot 1.18.2",
        price_1R1AETGLqZ8YjU1vkuXGLxKY: "EMC captcha solver",
      };

      productName = priceToProductMap[priceId] || "";
      console.log("Mapped product name from subscription:", productName);
    }

    if (!productName) {
      // Fallback: try to get product name from metadata
      productName = session.metadata?.product_name || "";
      console.log("Product name from metadata:", productName);
    }

    // Additional fallback: try to get product name from line items
    if (!productName) {
      try {
        console.log("Attempting to get product name from line items");
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
        );
        console.log("Line items retrieved:", lineItems.data.length);

        if (lineItems.data.length > 0) {
          const item = lineItems.data[0];
          console.log("First line item:", JSON.stringify(item));

          if (item.price && item.price.id) {
            const priceToProductMap: Record<string, string> = {
              price_1R1A9uGLqZ8YjU1vEkXXC79n: "Autovoter",
              price_1R1AE1GLqZ8YjU1vUrS3ZSXJ: "Factionsbot 1.18.2",
              price_1R1AETGLqZ8YjU1vkuXGLxKY: "EMC captcha solver",
            };

            productName =
              priceToProductMap[item.price.id] || item.description || "";
            console.log("Product name from line items:", productName);

            // If we have a subscription, update its metadata with the product name
            if (productName && subscriptionId) {
              const { data: verifySubscription } = await supabaseClient
                .from("subscriptions")
                .select("id")
                .eq("stripe_id", subscriptionId)
                .single();

              if (verifySubscription) {
                console.log(
                  "Updating subscription metadata with product name from line items:",
                  productName,
                );
                await supabaseClient
                  .from("subscriptions")
                  .update({
                    metadata: {
                      ...(session.metadata || {}),
                      checkoutSessionId: session.id,
                      product_name: productName,
                    },
                  })
                  .eq("id", verifySubscription.id);
              }
            }
          }
        }
      } catch (lineItemError) {
        console.error("Error fetching line items:", lineItemError);
        // Continue with license creation even if line items fetch fails
      }
    }

    if (!productName) {
      console.error("Could not determine product name, using fallback");
      // Use a fallback product name instead of throwing an error
      productName = "Unknown Product";
    }

    // Generate a license key for the product
    console.log("Generating license key for product:", productName);
    const productCode = productName
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase();

    console.log("Using product code for license generation:", productCode);

    // Call the RPC function to generate a license key
    const { data: licenseKeyData, error: licenseKeyError } =
      await supabaseClient.rpc("generate_license_key", {
        product_code: productCode,
      });

    if (licenseKeyError) {
      console.error("Error generating license key:", licenseKeyError);
      throw new Error(
        `Failed to generate license key: ${licenseKeyError.message}`,
      );
    }

    if (!licenseKeyData) {
      console.error("No license key was generated");
      throw new Error("License key generation failed - no key returned");
    }

    const licenseKey = licenseKeyData;
    console.log("Successfully generated license key:", licenseKey);
    console.log("Generated license key:", licenseKey);

    // Check if a license already exists for this user and product
    const { data: existingLicense, error: licenseCheckError } =
      await supabaseClient
        .from("licenses")
        .select("id")
        .eq("user_id", userId)
        .eq("product_name", productName)
        .maybeSingle();

    if (licenseCheckError) {
      console.error("Error checking for existing license:", licenseCheckError);
    }

    // If license already exists, don't create a new one
    if (existingLicense) {
      console.log(
        "License already exists for this user and product:",
        existingLicense.id,
      );
    } else {
      // Insert the license into the licenses table
      const timestamp = new Date().toISOString();
      const licenseData = {
        user_id: userId,
        product_name: productName,
        license_key: licenseKey,
        active: true,
        created_at: timestamp,
        updated_at: timestamp,
      };

      console.log("Inserting license with data:", JSON.stringify(licenseData));

      // Explicitly insert the license into the licenses table
      const { data: insertedLicense, error: licenseInsertError } =
        await supabaseClient.from("licenses").insert(licenseData).select();

      console.log(
        "License insertion result:",
        insertedLicense ? "Success" : "Failed",
      );

      if (licenseInsertError) {
        console.error("Error inserting license:", licenseInsertError);
        throw new Error(
          `Failed to insert license: ${licenseInsertError.message}`,
        );
      }

      console.log("License created successfully for user:", userId);
    }

    // Verify the license was created
    const { data: verifyLicense, error: verifyError } = await supabaseClient
      .from("licenses")
      .select("id, license_key")
      .eq("user_id", userId)
      .eq("product_name", productName)
      .maybeSingle();

    if (verifyError) {
      console.error("Error verifying license creation:", verifyError);
    } else if (!verifyLicense) {
      console.error(
        "License verification failed - no license found after creation",
      );
    } else {
      console.log("License verified successfully:", verifyLicense.id);
    }

    return new Response(
      JSON.stringify({
        message: "Checkout session completed successfully",
        subscriptionId: subscriptionId || null,
        licenseKey,
        licenseVerified: !!verifyLicense,
        subscriptionVerified: subscriptionId ? true : null,
        productName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing checkout completion:", error);
    console.error(
      "Error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to process checkout completion",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleInvoicePaymentSucceeded(supabaseClient: any, event: any) {
  const invoice = event.data.object;
  console.log("Handling invoice payment succeeded:", invoice.id);

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  try {
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("stripe_id", subscriptionId)
      .single();

    const webhookData = {
      event_type: event.type,
      type: "invoice",
      stripe_event_id: event.id,
      data: {
        invoiceId: invoice.id,
        subscriptionId,
        amountPaid: String(invoice.amount_paid / 100),
        currency: invoice.currency,
        status: "succeeded",
        email: subscription?.email || invoice.customer_email,
      },
    };

    await supabaseClient.from("webhook_events").insert(webhookData);

    return new Response(
      JSON.stringify({ message: "Invoice payment succeeded" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing successful payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process successful payment" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function handleInvoicePaymentFailed(supabaseClient: any, event: any) {
  const invoice = event.data.object;
  console.log("Handling invoice payment failed:", invoice.id);

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  try {
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("stripe_id", subscriptionId)
      .single();

    const webhookData = {
      event_type: event.type,
      type: "invoice",
      stripe_event_id: event.id,
      data: {
        invoiceId: invoice.id,
        subscriptionId,
        amountDue: String(invoice.amount_due / 100),
        currency: invoice.currency,
        status: "failed",
        email: subscription?.email || invoice.customer_email,
      },
    };

    await supabaseClient.from("webhook_events").insert(webhookData);

    if (subscriptionId) {
      await updateSubscriptionStatus(
        supabaseClient,
        subscriptionId,
        "past_due",
      );
    }

    return new Response(JSON.stringify({ message: "Invoice payment failed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing failed payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process failed payment" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

// Main webhook handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No signature found");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error("Error verifying webhook signature:", err);
      throw new Error("Invalid signature");
    }

    console.log("Processing webhook event:", event.type);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Log the webhook event
    await logAndStoreWebhookEvent(supabaseClient, event, event.data.object);

    // Handle the event based on type
    switch (event.type) {
      case "customer.subscription.created":
        return await handleSubscriptionCreated(supabaseClient, event);
      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(supabaseClient, event);
      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(supabaseClient, event);
      case "checkout.session.completed":
        return await handleCheckoutSessionCompleted(supabaseClient, event);
      case "invoice.payment_succeeded":
        return await handleInvoicePaymentSucceeded(supabaseClient, event);
      case "invoice.payment_failed":
        return await handleInvoicePaymentFailed(supabaseClient, event);
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ message: `Unhandled event type: ${event.type}` }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
