import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import {
  getRecentActivity,
  formatActivityForDisplay,
  logActivity,
} from "@/lib/api/activity";
import { useToast } from "@/components/ui/use-toast";

export default function ActivityLogStoryboard() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentActivity(20);
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreateTestActivity = async () => {
    try {
      await logActivity("test_event", "admin", {
        description: "Test activity created from admin dashboard",
      });
      toast({
        title: "Success",
        description: "Test activity created successfully",
      });
      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error("Error creating test activity:", error);
      toast({
        title: "Error",
        description: "Failed to create test activity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-400" />
            Activity Logs
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateTestActivity}
            >
              Create Test Activity
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchActivities}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-green-400" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No activity logs found
              </div>
            ) : (
              activities.map((activity) => {
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
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {activity.id}
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
    </div>
  );
}
