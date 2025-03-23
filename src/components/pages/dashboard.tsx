import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import ReviewDialog from "../dashboard/ReviewDialog";
import LicenseCard from "../dashboard/LicenseCard";
import { Loader2 } from "lucide-react";
import { getUserLicenses, type License } from "@/lib/api/licenses";
import { useToast } from "@/components/ui/use-toast";
import GearsBackground from "../dashboard/GearsBackground";
import { motion } from "framer-motion";

interface Subscription {
  id: string;
  stripe_id: string;
  status: string;
  price_id: string;
  amount: number;
  currency: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  current_period_start?: number;
  started_at?: number;
  metadata?: Record<string, any>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Record<string, Subscription>
  >({});
  const [loading, setLoading] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const realtimeSubscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    console.log("Dashboard component mounted, user state:", !!user);

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log("Dashboard loading timeout check, current state:", {
        loading,
        isLoadingSubscriptions,
      });
      if (loading || isLoadingSubscriptions) {
        console.log("Dashboard loading timeout reached, forcing state update");
        setLoading(false);
        setIsLoadingSubscriptions(false);
        // Only show toast in development environment
        if (import.meta.env.DEV) {
          toast({
            title: "Loading timeout",
            description:
              "Dashboard data took too long to load. Some data might be missing.",
            variant: "destructive",
          });
        }
      }
    }, 5000); // Increased to 5 second timeout to allow data to load properly

    const initDashboard = async () => {
      try {
        // Verify user session is valid before proceeding
        if (!user) {
          console.log(
            "No user found in session, aborting dashboard initialization",
          );
          setLoading(false);
          return;
        }

        console.log("Initializing dashboard data for user:", user.id);

        // Fetch licenses first, then subscriptions to ensure we have licenses to map to
        try {
          await fetchLicenses();
        } catch (licenseError) {
          console.error("Error fetching licenses:", licenseError);
        }

        try {
          await fetchSubscriptions();
        } catch (subscriptionError) {
          console.error("Error fetching subscriptions:", subscriptionError);
        }

        console.log("Dashboard data initialized successfully");
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        // Only show toast in development environment
        if (import.meta.env.DEV) {
          toast({
            title: "Error",
            description:
              "Failed to load dashboard data. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        // Ensure loading state is always updated
        setLoading(false);
      }
    };

    // Only initialize if we have a user
    if (user) {
      initDashboard();
    } else {
      console.log("No user in session, skipping dashboard initialization");
      setLoading(false);
    }

    // Set up realtime subscription for licenses and subscriptions
    if (user) {
      console.log("Setting up realtime subscriptions for user", user.id);
      try {
        realtimeSubscriptionRef.current = supabase
          .channel("dashboard-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "licenses" },
            () => {
              console.log("Licenses table changed, fetching updated data");
              fetchLicenses().catch((err) =>
                console.error("Error refreshing licenses:", err),
              );
            },
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "subscriptions" },
            () => {
              console.log("Subscriptions table changed, fetching updated data");
              fetchSubscriptions().catch((err) =>
                console.error("Error refreshing subscriptions:", err),
              );
            },
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
          });
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
      }
    }

    // Cleanup subscription when component unmounts
    return () => {
      clearTimeout(loadingTimeout);
      if (realtimeSubscriptionRef.current) {
        console.log("Cleaning up realtime subscription");
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  const fetchLicenses = async () => {
    try {
      if (!user) {
        console.log("No user found, skipping license fetch");
        setLoading(false);
        return [];
      }

      console.log("Fetching user licenses for user ID:", user.id);
      const userLicenses = await getUserLicenses();
      console.log("Licenses fetched successfully:", userLicenses.length);
      setLicenses(userLicenses);
      setLoading(false);
      return userLicenses;
    } catch (error) {
      console.error("Error fetching licenses:", error);
      toast({
        title: "Error",
        description: "Failed to load your licenses. Please try again later.",
        variant: "destructive",
      });
      // Set loading to false on error and return empty array
      setLoading(false);
      return [];
    }
  };

  const fetchSubscriptions = async () => {
    if (!user) {
      console.log("No user found, skipping subscription fetch");
      setIsLoadingSubscriptions(false);
      return {};
    }

    console.log("Fetching subscriptions for user", user.id);
    setIsLoadingSubscriptions(true);
    try {
      // Increase timeout to allow for subscription data to load
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 5000); // Increased timeout to 5 seconds
      });

      const fetchPromise = supabase
        .from("subscriptions")
        .select(
          "id, stripe_id, status, price_id, amount, currency, metadata, cancel_at_period_end, current_period_end, current_period_start, started_at",
        )
        .eq("user_id", user.id);

      // Race between the fetch and the timeout
      const { data, error } = (await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => ({
          data: null,
          error: new Error("Request timeout"),
        })),
      ])) as any;

      if (error) {
        console.error("Supabase error fetching subscriptions:", error);
        // Don't throw, just return empty object
        return {};
      }

      // Create a map of product name to subscription
      const subscriptionMap: Record<string, Subscription> = {};

      if (data && data.length > 0) {
        console.log("Subscriptions found:", data.length);

        // First, try to map subscriptions using metadata.product_name
        for (const sub of data) {
          // Extract product name from metadata if available
          const productName = sub.metadata?.product_name;

          // Debug log to see what's in the metadata
          console.log("Subscription metadata for", sub.id, ":", sub.metadata);

          if (productName) {
            console.log(`Mapping subscription to product: ${productName}`);
            subscriptionMap[productName] = sub;
          }
        }

        // If we couldn't map any subscriptions using metadata, try to map them to licenses
        if (Object.keys(subscriptionMap).length === 0 && licenses.length > 0) {
          console.log("No product_name in metadata, using fallback mapping");

          // Try to match subscriptions to licenses by creation date proximity
          if (licenses.length > 0 && data.length > 0) {
            // For each license, find the closest subscription by creation time
            licenses.forEach((license) => {
              const licenseCreatedAt = new Date(license.created_at).getTime();

              // Find the subscription with the closest creation time to the license
              let closestSub = data[0];
              let smallestTimeDiff = Infinity;

              data.forEach((sub) => {
                const subCreatedAt = sub.started_at
                  ? new Date(sub.started_at * 1000).getTime()
                  : 0;
                const timeDiff = Math.abs(licenseCreatedAt - subCreatedAt);

                if (timeDiff < smallestTimeDiff) {
                  smallestTimeDiff = timeDiff;
                  closestSub = sub;
                }
              });

              const productName = license.product_name;
              console.log(
                `Mapping subscription to license by time proximity: ${productName}`,
              );
              subscriptionMap[productName] = closestSub;
            });
          } else {
            // Fallback to simple index mapping if time-based mapping fails
            data.forEach((sub, index) => {
              if (index < licenses.length) {
                const productName = licenses[index].product_name;
                console.log(
                  `Fallback mapping to license by index: ${productName}`,
                );
                subscriptionMap[productName] = sub;
              }
            });
          }
        }
      } else {
        console.log("No subscriptions found for user");
      }

      console.log(
        "Final subscription map:",
        Object.keys(subscriptionMap).length,
        "subscriptions mapped",
      );
      setSubscriptions(subscriptionMap);
      // Force a re-render after mapping subscriptions
      setSubscriptions({ ...subscriptionMap });
      setIsLoadingSubscriptions(false);
      return subscriptionMap;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      // Don't show toast for network errors in production
      if (import.meta.env.DEV) {
        toast({
          title: "Warning",
          description:
            "Could not load subscription information. Some features may be limited.",
          variant: "destructive",
        });
      }
      return {};
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const openDiscord = () => {
    window.open("https://discord.gg/5MbAqAhaCR", "_blank");
  };

  // Add a timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached in render phase");
        setLoadingTimeout(true);
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GearsBackground />
        <div className="flex flex-col items-center bg-white/80 px-6 py-4 rounded-lg shadow-sm z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="h-6 w-6 animate-spin text-green-400" />
            <span>Loading your licenses...</span>
          </div>
          {loadingTimeout && (
            <div className="text-sm text-amber-600 mt-2">
              <p>This is taking longer than expected.</p>
              <div className="flex flex-col space-y-2 mt-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    try {
                      // Try to refresh the session
                      const { refreshSession } = useAuth();
                      await refreshSession();
                      toast({
                        title: "Session refreshed",
                        description: "Attempting to reload your data...",
                      });
                      // Reload the page after session refresh
                      window.location.reload();
                    } catch (error) {
                      console.error("Error refreshing session:", error);
                      toast({
                        title: "Session Error",
                        description:
                          "Could not refresh your session. Please try signing in again.",
                        variant: "destructive",
                      });
                      // Redirect to login
                      window.location.href = "/login";
                    }
                  }}
                >
                  Refresh Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GearsBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {"Your products".split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                  {word.split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      className={`inline-block ${wordIndex === 1 && index < 8 ? "text-green-400" : ""}`}
                      initial={{ y: 0 }}
                      animate={{ y: [-20, 0] }}
                      transition={{
                        delay: (wordIndex * word.length + index) * 0.05,
                        duration: 0.5,
                        times: [0, 1],
                        ease: "easeOut",
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                  {wordIndex === 0 && (
                    <span className="inline-block">&nbsp;</span>
                  )}
                </span>
              ))}
            </motion.h1>
            <p className="text-gray-600">
              Manage your Craftology Inc. product licenses
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => (window.location.href = "/")}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <Button
              onClick={openDiscord}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <ReviewDialog licenses={licenses} />
          </div>
        </div>

        {licenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              You don't have any active licenses yet.
            </p>
            <Button
              onClick={() => (window.location.href = "/#products-section")}
              className="bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
            >
              <span className="relative z-10 transition-colors duration-300">
                Browse products
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license) => {
              // Find subscription for this product if it exists
              const subscription = subscriptions[license.product_name];

              return (
                <LicenseCard
                  key={license.id}
                  id={license.id}
                  productName={license.product_name}
                  licenseKey={license.license_key}
                  hwid={license.hwid}
                  lastResetDate={license.last_reset_date}
                  onReset={fetchLicenses}
                  active={license.active}
                  subscriptionId={subscription?.stripe_id}
                  price={subscription?.amount}
                  currency={subscription?.currency}
                  verificationStatus={
                    license.active ? "verified" : "unverified"
                  }
                  isLoadingSubscriptions={isLoadingSubscriptions}
                  subscriptionStartDate={
                    subscription?.current_period_start ||
                    subscription?.started_at
                  }
                  subscriptionEndDate={subscription?.current_period_end}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
