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
    fetchLicenses();
    fetchSubscriptions();

    // Set up realtime subscription for licenses and subscriptions
    if (user) {
      realtimeSubscriptionRef.current = supabase
        .channel("dashboard-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "licenses" },
          () => {
            console.log("Licenses table changed, fetching updated data");
            fetchLicenses();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subscriptions" },
          () => {
            console.log("Subscriptions table changed, fetching updated data");
            fetchSubscriptions();
          },
        )
        .subscribe();
    }

    // Cleanup subscription when component unmounts
    return () => {
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  const fetchLicenses = async () => {
    try {
      const userLicenses = await getUserLicenses();
      setLicenses(userLicenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      toast({
        title: "Error",
        description: "Failed to load your licenses. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    if (!user) {
      setIsLoadingSubscriptions(false);
      return;
    }

    setIsLoadingSubscriptions(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id, stripe_id, status, price_id, amount, currency, metadata, cancel_at_period_end, current_period_end",
        )
        .eq("user_id", user.id);

      if (error) throw error;

      // Create a map of product name to subscription
      const subscriptionMap: Record<string, Subscription> = {};

      if (data && data.length > 0) {
        console.log("Subscriptions found:", data);

        // First, try to map subscriptions using metadata.product_name
        data.forEach((sub) => {
          // Extract product name from metadata if available
          const productName = sub.metadata?.product_name;

          // Debug log to see what's in the metadata
          console.log("Subscription metadata:", sub.metadata);

          if (productName) {
            console.log(`Mapping subscription to product: ${productName}`);
            subscriptionMap[productName] = sub;
          }
        });

        // If we couldn't map any subscriptions using metadata, try to map them to licenses
        if (Object.keys(subscriptionMap).length === 0 && licenses.length > 0) {
          console.log("No product_name in metadata, using fallback mapping");

          // Map each subscription to a license if possible
          data.forEach((sub, index) => {
            if (index < licenses.length) {
              const productName = licenses[index].product_name;
              console.log(`Fallback mapping to license: ${productName}`);
              subscriptionMap[productName] = sub;
            }
          });
        }
      } else {
        console.log("No subscriptions found for user");
      }

      console.log("Final subscription map:", subscriptionMap);
      setSubscriptions(subscriptionMap);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const openDiscord = () => {
    window.open("https://discord.gg/5MbAqAhaCR", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GearsBackground />
        <div className="flex items-center space-x-2 bg-white/80 px-6 py-3 rounded-lg shadow-sm z-10">
          <Loader2 className="h-6 w-6 animate-spin text-green-400" />
          <span>Loading your licenses...</span>
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
