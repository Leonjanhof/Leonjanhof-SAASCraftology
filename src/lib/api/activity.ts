import { supabase } from "../../../supabase/supabase";

export interface ActivityLog {
  id: string;
  event_type: string;
  type: string;
  created_at: string;
  data: any;
}

// Function to log client-side activity
export async function logActivity(
  eventType: string,
  type: string,
  data: any = {},
) {
  try {
    // Get current user ID if available
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Store user info in the data object instead
    if (user?.id) {
      data = { ...data, userId: user.id, userEmail: user.email };
    }

    // Call the log-activity edge function
    const { data: response, error } = await supabase.functions.invoke(
      "supabase-functions-log-activity",
      {
        body: {
          event_type: eventType,
          type: type,
          data: data,
        },
      },
    );

    if (error) {
      console.error("Error logging activity:", error);
      return { success: false, error };
    }

    return { success: true, data: response };
  } catch (error) {
    console.error("Exception in logActivity:", error);
    return { success: false, error };
  }
}

// Function to fetch recent activity logs
export async function getRecentActivity(
  limit: number = 10,
): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from("webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }

    return data as ActivityLog[];
  } catch (error) {
    console.error("Exception in getRecentActivity:", error);
    return [];
  }
}

// Function to format activity for display
export function formatActivityForDisplay(activity: ActivityLog): {
  action: string;
  details: string;
  time: string;
} {
  // Format the timestamp
  const timeAgo = getTimeAgo(new Date(activity.created_at));

  // Default values
  let action = activity.event_type;
  let details = JSON.stringify(activity.data).substring(0, 100);

  // Format based on activity type
  switch (activity.type) {
    case "auth":
      action = `Auth: ${activity.event_type}`;
      if (activity.data?.email) {
        details = `User: ${activity.data.email}`;
      }
      break;

    case "subscription":
      action = `Subscription ${activity.event_type}`;
      if (activity.data?.subscriptionId) {
        details = `Subscription ID: ${activity.data.subscriptionId}`;
      }
      break;

    case "license":
      action = `License ${activity.event_type}`;
      if (activity.data?.licenseKey) {
        details = `License: ${activity.data.licenseKey}`;
      }
      break;

    case "user":
      action = `User ${activity.event_type}`;
      if (activity.data?.email) {
        details = `User: ${activity.data.email}`;
      }
      break;

    case "invoice":
      action = `Payment ${activity.data?.status || activity.event_type}`;
      if (activity.data?.amountPaid) {
        details = `Amount: ${activity.data.amountPaid} ${activity.data.currency || "USD"}`;
      }
      break;

    case "admin":
      action = `Admin ${activity.event_type}`;
      details = activity.data?.description || details;
      break;
  }

  return {
    action,
    details,
    time: timeAgo,
  };
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}
