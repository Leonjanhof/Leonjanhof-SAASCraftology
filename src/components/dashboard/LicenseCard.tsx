import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Key,
  Monitor,
  RefreshCw,
  DollarSign,
  Ban,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { resetHWID } from "@/lib/api/licenses";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../../../supabase/supabase";

interface LicenseCardProps {
  id: string;
  productName: string;
  licenseKey: string;
  hwid?: string | null;
  lastResetDate?: string | null;
  onReset?: () => void;
  active?: boolean;
  subscriptionId?: string | null;
  price?: number | null;
  currency?: string | null;
  verificationStatus?: "verified" | "unverified" | "pending";
  isLoadingSubscriptions?: boolean;
}

const LicenseCard: React.FC<LicenseCardProps> = ({
  id,
  productName,
  licenseKey,
  hwid,
  lastResetDate,
  onReset,
  active = true,
  subscriptionId = null,
  price = null,
  currency = "USD",
  verificationStatus = "unverified",
  isLoadingSubscriptions = false,
}) => {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(
    null,
  );
  const [isCancelled, setIsCancelled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "License key copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleResetHWID = async () => {
    try {
      setIsResetting(true);
      const result = await resetHWID(id);

      if (result.success) {
        toast({
          title: "HWID Reset",
          description: "Your hardware ID has been successfully reset.",
        });
        if (onReset) onReset();
      } else {
        toast({
          title: "Reset Failed",
          description:
            result.message || "You can only reset your HWID once per week.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting HWID:", error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your hardware ID.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "No subscription found for this license",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCancelling(true);

      // Call Stripe API through Supabase Edge Function to cancel subscription
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-cancel-subscription",
        {
          body: { subscription_id: subscriptionId },
        },
      );

      if (error) {
        throw error;
      }

      // Update local state with subscription end date
      if (data?.data?.current_period_end) {
        const endDate = new Date(data.data.current_period_end * 1000);
        setSubscriptionEndDate(endDate.toLocaleDateString());
        setIsCancelled(true);
      }

      toast({
        title: "Subscription Cancelled",
        description:
          "Your subscription has been successfully cancelled. You will have access until the end of your billing period.",
      });

      if (onReset) onReset(); // Refresh license data
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description:
          "There was an error cancelling your subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if a week has passed since the last reset
  const canReset = () => {
    if (!lastResetDate) return true;

    const lastReset = new Date(lastResetDate);
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    return now.getTime() - lastReset.getTime() >= oneWeek;
  };

  // Calculate time remaining until next reset
  const getTimeRemaining = () => {
    if (!lastResetDate) return "";

    const lastReset = new Date(lastResetDate);
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const nextResetTime = new Date(lastReset.getTime() + oneWeek);

    if (now >= nextResetTime) return "";

    const remainingMs = nextResetTime.getTime() - now.getTime();
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
    );

    return `${days}d ${hours}h remaining`;
  };

  // Format price with currency
  const formatPrice = () => {
    if (!price) return "";

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    });

    return formatter.format(price / 100); // Assuming price is in cents
  };

  // Check if subscription is already cancelled
  React.useEffect(() => {
    // Check if we have subscription data from props
    const checkSubscriptionStatus = async () => {
      if (subscriptionId) {
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .select("cancel_at_period_end, current_period_end")
            .eq("stripe_id", subscriptionId)
            .single();

          if (error) throw error;

          if (data?.cancel_at_period_end && data?.current_period_end) {
            const endDate = new Date(data.current_period_end * 1000);
            setSubscriptionEndDate(endDate.toLocaleDateString());
            setIsCancelled(true);
          }
        } catch (err) {
          console.error("Error checking subscription status:", err);
        }
      }
    };

    checkSubscriptionStatus();
  }, [subscriptionId]);

  // Verify license with API
  const verifyLicense = async () => {
    try {
      setIsVerifying(true);

      // Call the verify-license edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-verify-license",
        {
          body: {
            license_key: licenseKey,
            hwid: null, // No HWID for initial verification
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data?.valid) {
        toast({
          title: "License Verified",
          description:
            "Your license has been successfully verified and activated.",
        });
        if (onReset) onReset(); // Refresh license data
      } else {
        toast({
          title: "Verification Failed",
          description:
            data?.message || "Failed to verify license. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying license:", error);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your license.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900">
            {productName}
          </CardTitle>
          <Badge
            variant={active ? "default" : "outline"}
            className={
              active
                ? "bg-green-400 hover:bg-green-500"
                : "text-gray-500 border-gray-300"
            }
          >
            {verificationStatus === "verified" || active ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Active
              </>
            ) : verificationStatus === "pending" ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Pending
              </>
            ) : (
              <>
                <Ban className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        {price && (
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <DollarSign className="h-4 w-4 text-green-400 mr-1" />
            <span>{formatPrice()}/month</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {(!active || verificationStatus === "unverified") && (
          <div className="mb-2 p-3 bg-amber-50 text-amber-800 rounded-md">
            <div className="text-sm">
              <p className="font-medium">License not activated</p>
              <p>
                Your license needs to be verified with our API before it can be
                used. Once verified, your license will become active.
              </p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Key className="h-4 w-4 text-green-400" />
              <span>License key:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(licenseKey)}
              className="text-green-500 hover:text-green-600 hover:bg-green-50 h-8 rounded-md px-3 text-xs"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <code className="block p-2 bg-gray-100 rounded text-sm font-mono break-all">
            {licenseKey}
          </code>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Monitor className="h-4 w-4 text-green-400" />
              <span>HWID STATUS:</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetHWID}
                    disabled={isResetting || !canReset()}
                    className={`h-8 w-8 p-0 rounded-full ${canReset() ? "text-green-500 hover:text-green-600 hover:bg-green-50" : "text-gray-400"}`}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isResetting ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {canReset()
                    ? "Reset hardware ID"
                    : `Reset limit: ${getTimeRemaining()}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {hwid ? (
            <div className="p-2 bg-gray-100 rounded text-sm font-mono break-all">
              {hwid}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No HWID bound to this license
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 border-t border-gray-100">
        {isLoadingSubscriptions ? (
          <div className="w-full flex items-center justify-center py-2">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin text-green-400" />
            <span className="text-sm text-gray-500">
              Loading subscription info...
            </span>
          </div>
        ) : subscriptionId ? (
          isCancelled || subscriptionEndDate ? (
            <div className="w-full text-center">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-center">
                <p className="text-sm font-medium">Subscription cancelled</p>
                <p className="text-sm">Access ends on {subscriptionEndDate}.</p>
              </div>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-green-400"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Cancel subscription</>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-4">
                      <p>
                        You are about to cancel your subscription for{" "}
                        <strong>{productName}</strong>.
                      </p>
                      <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p className="text-sm">
                          You will still have access until the end of your
                          current billing period, but your subscription will not
                          renew.
                        </p>
                      </div>
                      <p>
                        This action cannot be undone. You would need to purchase
                        a new subscription if you change your mind.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Yes, cancel subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        ) : (
          <div className="w-full text-center">
            <p className="text-sm text-gray-500">
              No active subscription found
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default LicenseCard;
