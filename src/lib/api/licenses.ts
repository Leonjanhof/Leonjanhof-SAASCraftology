import { supabase } from "../../../supabase/supabase";

export interface License {
  id: string;
  user_id: string;
  product_name: string;
  license_key: string;
  hwid: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  last_reset_date?: string | null;
}

export async function getUserLicenses(): Promise<License[]> {
  try {
    console.log("Fetching user licenses...");

    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>(
      (_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 5000);
      },
    );

    // Get the current user with timeout
    const userPromise = supabase.auth.getUser();

    const {
      data: { user },
      error: userError,
    } = (await Promise.race([userPromise, timeoutPromise])) as any;

    if (userError) {
      console.error("Error getting current user:", userError);
      return []; // Return empty array instead of throwing
    }

    if (!user) {
      console.error("No authenticated user found");
      return []; // Return empty array instead of throwing
    }

    console.log("Fetching licenses for user ID:", user.id);

    // Fetch licenses for the current user only with timeout
    const licensePromise = supabase
      .from("licenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const licenseTimeoutPromise = new Promise<{ data: null; error: Error }>(
      (_, reject) => {
        setTimeout(() => reject(new Error("License fetch timeout")), 5000);
      },
    );

    const { data, error } = (await Promise.race([
      licensePromise,
      licenseTimeoutPromise,
    ])) as any;

    if (error) {
      console.error("Error fetching licenses:", error);
      return []; // Return empty array instead of throwing
    }

    console.log(
      "Licenses fetched successfully:",
      data?.length || 0,
      "licenses found",
    );
    return data || [];
  } catch (e) {
    console.error("Exception in getUserLicenses:", e);
    // Return empty array instead of throwing to prevent app from crashing
    return [];
  }
}

export async function updateHWID(licenseId: string, hwid: string) {
  const { error } = await supabase
    .from("licenses")
    .update({ hwid, updated_at: new Date().toISOString() })
    .eq("id", licenseId);

  if (error) {
    console.error("Error updating HWID:", error);
    throw error;
  }
}

export async function resetHWID(
  licenseId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // First check if a week has passed since the last reset
    const { data: license, error: fetchError } = await supabase
      .from("licenses")
      .select("last_reset_date")
      .eq("id", licenseId)
      .single();

    if (fetchError) {
      console.error("Error fetching license:", fetchError);
      return { success: false, message: "Failed to check reset eligibility" };
    }

    // Check if a week has passed since the last reset
    if (license.last_reset_date) {
      const lastReset = new Date(license.last_reset_date);
      const now = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      if (now.getTime() - lastReset.getTime() < oneWeek) {
        return {
          success: false,
          message: "You can only reset your HWID once per week",
        };
      }
    }

    // If eligible, reset the HWID
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("licenses")
      .update({
        hwid: null,
        updated_at: now,
        last_reset_date: now,
      })
      .eq("id", licenseId);

    if (updateError) {
      console.error("Error resetting HWID:", updateError);
      return { success: false, message: "Failed to reset HWID" };
    }

    return { success: true };
  } catch (e) {
    console.error("Exception in resetHWID:", e);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(
      `Calling cancel-subscription function for subscription: ${subscriptionId}`,
    );
    const { data, error } = await supabase.functions.invoke(
      "cancel-subscription",
      {
        body: { subscription_id: subscriptionId },
      },
    );

    if (error) {
      console.error("Error cancelling subscription:", error);
      return {
        success: false,
        message: error.message || "Failed to cancel subscription",
      };
    }

    console.log("Subscription cancellation response:", data);
    return {
      success: true,
      message: data?.message || "Subscription canceled successfully",
    };
  } catch (e) {
    console.error("Exception in cancelSubscription:", e);
    return { success: false, message: "An unexpected error occurred" };
  }
}
