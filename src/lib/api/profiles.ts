import { supabase } from "../../../supabase/supabase";
import { MicrosoftAccount } from "@/lib/auth/microsoft";
import {
  InitialFormData,
  HubFormData,
  AFKFormData,
  ReconnectFormData,
} from "@/lib/hooks/useProfileFormState";

export interface ProfileData {
  id?: string;
  name: string;
  server: string;
  protocol: string;
  user_id: string;
  hub_settings?: HubFormData;
  afk_settings?: AFKFormData;
  reconnect_settings?: ReconnectFormData;
  created_at?: string;
  updated_at?: string;
}

// Save a voting profile to the database
export async function saveVotingProfile(profileData: ProfileData) {
  try {
    const { data, error } = await supabase
      .from("profile_voting")
      .upsert(profileData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error saving voting profile:", error);
    return { data: null, error };
  }
}

// Save a hosting profile to the database
export async function saveHostingProfile(profileData: ProfileData) {
  try {
    const { data, error } = await supabase
      .from("profile_hosting")
      .upsert(profileData)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error saving hosting profile:", error);
    return { data: null, error };
  }
}

// Get all voting profiles for the current user
export async function getVotingProfiles() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("profile_voting")
      .select("*")
      .eq("user_id", userData.user.id);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting voting profiles:", error);
    return { data: null, error };
  }
}

// Get all hosting profiles for the current user
export async function getHostingProfiles() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("profile_hosting")
      .select("*")
      .eq("user_id", userData.user.id);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting hosting profiles:", error);
    return { data: null, error };
  }
}

// Delete a voting profile
export async function deleteVotingProfile(profileId: string) {
  try {
    const { error } = await supabase
      .from("profile_voting")
      .delete()
      .eq("id", profileId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting voting profile:", error);
    return { success: false, error };
  }
}

// Delete a hosting profile
export async function deleteHostingProfile(profileId: string) {
  try {
    const { error } = await supabase
      .from("profile_hosting")
      .delete()
      .eq("id", profileId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting hosting profile:", error);
    return { success: false, error };
  }
}

// Save a Microsoft account to the database
export async function saveMicrosoftAccount(
  account: MicrosoftAccount,
  profileId: string,
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("minecraft_accounts")
      .upsert({
        id: account.id,
        user_id: userData.user.id,
        profile_id: profileId,
        profile_type: "voting", // Only voting profiles have Microsoft accounts
        username: account.username,
        microsoft_refresh_token: account.refreshToken,
        minecraft_token: null, // Will be refreshed when needed
        token_expires_at: null,
        last_refresh_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error saving Microsoft account:", error);
    return { data: null, error };
  }
}

// Get all Microsoft accounts for a specific profile
export async function getMicrosoftAccounts(profileId: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("minecraft_accounts")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("profile_id", profileId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting Microsoft accounts:", error);
    return { data: null, error };
  }
}

// Delete a Microsoft account
export async function deleteMicrosoftAccount(accountId: string) {
  try {
    const { error } = await supabase
      .from("minecraft_accounts")
      .delete()
      .eq("id", accountId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting Microsoft account:", error);
    return { success: false, error };
  }
}

// Refresh a Minecraft token using the Microsoft refresh token
export async function refreshMinecraftToken(accountId: string) {
  try {
    // First, get the account with the refresh token
    const { data: account, error: accountError } = await supabase
      .from("minecraft_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accountError) throw accountError;
    if (!account) throw new Error("Account not found");

    // This would typically call a server-side function to refresh the token
    // For now, we'll just update the last_refresh_at timestamp
    const { data, error } = await supabase
      .from("minecraft_accounts")
      .update({
        last_refresh_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error refreshing Minecraft token:", error);
    return { data: null, error };
  }
}
