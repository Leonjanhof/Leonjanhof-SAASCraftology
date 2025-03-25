import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Database,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  getRecentActivity,
  formatActivityForDisplay,
  ActivityLog,
} from "@/lib/api/activity";

interface AdminOverviewProps {
  onTabChange: (tab: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ onTabChange }) => {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [licenseCount, setLicenseCount] = useState<number | null>(null);
  const [activeLicenseCount, setActiveLicenseCount] = useState<number | null>(
    null,
  );
  const [systemStatus, setSystemStatus] = useState<
    "active" | "inactive" | "checking"
  >("checking");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check system status
      const isConnected = await checkSupabaseConnection();
      setSystemStatus(isConnected ? "active" : "inactive");

      // Fetch user count
      const { count: userCountResult, error: userError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (userError) throw userError;
      setUserCount(userCountResult);

      // Fetch license counts
      const { count: totalLicenseCount, error: licenseError } = await supabase
        .from("licenses")
        .select("*", { count: "exact", head: true });

      if (licenseError) throw licenseError;
      setLicenseCount(totalLicenseCount);

      // Fetch active license count
      const { count: activeLicenses, error: activeLicenseError } =
        await supabase
          .from("licenses")
          .select("*", { count: "exact", head: true })
          .eq("active", true);

      if (activeLicenseError) throw activeLicenseError;
      setActiveLicenseCount(activeLicenses);

      // Fetch recent activity
      await fetchRecentActivity();
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to load statistics. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    setIsLoadingActivity(true);
    try {
      const activities = await getRecentActivity(10);
      setRecentActivity(activities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      // Don't show toast for activity errors to avoid overwhelming the user
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Helper function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });
      return !error;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up realtime subscription for webhook_events table
    const channel = supabase
      .channel("admin-activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "webhook_events" },
        () => {
          console.log("Activity change detected, refreshing activity data");
          fetchRecentActivity();
        },
      )
      .subscribe();

    return () => {
      // Clean up subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-400" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-400" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {userCount !== null ? userCount : "--"}
                </div>
                <p className="text-sm text-gray-500 mb-auto">
                  Total registered users
                </p>
              </>
            )}
            <div className="mt-4 flex">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => onTabChange("users")}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-400" />
              Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-400" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {activeLicenseCount !== null ? activeLicenseCount : "--"}
                </div>
                <div className="mb-auto">
                  <p className="text-sm text-gray-500">
                    Active licenses{" "}
                    {licenseCount !== null &&
                    activeLicenseCount !== null &&
                    licenseCount > 0
                      ? `(${Math.round((activeLicenseCount / licenseCount) * 100)}%)`
                      : ""}
                  </p>
                  {licenseCount !== null && licenseCount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {licenseCount} total licenses
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="mt-4 flex">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => onTabChange("licenses")}
              >
                Manage Licenses
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2 text-green-400" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {isLoading || systemStatus === "checking" ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-400" />
                <span className="text-gray-500">Checking...</span>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold flex items-center justify-center">
                  {systemStatus === "active" ? (
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center mb-auto">
                  System status
                </p>
              </>
            )}
            <div className="mt-4 flex">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => onTabChange("settings")}
              >
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-400" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecentActivity}
            disabled={isLoadingActivity}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoadingActivity ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingActivity ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-green-400" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent activity found
              </div>
            ) : (
              recentActivity.map((activity) => {
                const formattedActivity = formatActivityForDisplay(activity);
                return (
                  <div
                    key={activity.id}
                    className="flex justify-between items-start pb-3 border-b border-gray-100"
                  >
                    <div>
                      <div className="font-medium">
                        {formattedActivity.action}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formattedActivity.details}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formattedActivity.time}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminOverview;
