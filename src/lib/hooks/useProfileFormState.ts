import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  saveVotingProfile,
  saveHostingProfile,
  getVotingProfiles,
  getHostingProfiles,
  getMicrosoftAccounts,
  saveMicrosoftAccount,
  deleteMicrosoftAccount,
  ProfileData,
} from "../api/profiles";
import { MicrosoftAccount } from "../auth/microsoft";

export interface InitialFormData {
  profileName: string;
  serverAddress: string;
  protocol: string;
  mode: string;
  profileId?: string; // For editing existing profiles
}

export interface AccountsFormData {
  accounts: Array<{
    id: string;
    username: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }>;
  profileId?: string; // For linking accounts to a specific profile
}

export interface HubFormData {
  setting: "command" | "compass" | "none";
  commandInput: string;
  gridSize: "none" | "9x1" | "9x2" | "9x3" | "9x4" | "9x5" | "9x6";
  selectedSquare: { row: number; col: number } | null;
}

export interface AFKFormData {
  setting: "chatting" | "moving" | "none";
}

export interface ReconnectFormData {
  setting: "always" | "delayed" | "none";
}

export const useProfileFormState = (existingProfileId?: string) => {
  const [initialFormData, setInitialFormData] = useState<InitialFormData>({
    profileName: "",
    serverAddress: "",
    protocol: "auto",
    mode: "voting",
    profileId: existingProfileId,
  });

  const [accountsFormData, setAccountsFormData] = useState<AccountsFormData>({
    accounts: [],
    profileId: existingProfileId,
  });

  const [hubFormData, setHubFormData] = useState<HubFormData>({
    setting: "none",
    commandInput: "",
    gridSize: "none",
    selectedSquare: null,
  });

  const [afkFormData, setAFKFormData] = useState<AFKFormData>({
    setting: "none",
  });

  const [reconnectFormData, setReconnectFormData] = useState<ReconnectFormData>(
    {
      setting: "none",
    },
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile data if editing
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!existingProfileId) return;

      setLoading(true);
      setError(null);

      try {
        // First, determine if this is a voting or hosting profile
        // Try to get the specific profile directly first
        const { data: votingProfile } =
          await getVotingProfile(existingProfileId);
        const { data: hostingProfile } =
          await getHostingProfile(existingProfileId);

        let profile;
        let mode = "";

        if (votingProfile) {
          profile = votingProfile;
          mode = "voting";

          // Load Microsoft accounts for this profile
          const { data: accounts } =
            await getMicrosoftAccounts(existingProfileId);
          if (accounts) {
            setAccountsFormData({
              accounts: accounts.map((acc) => ({
                id: acc.id,
                username: acc.username,
                refreshToken: acc.microsoft_refresh_token,
              })),
              profileId: existingProfileId,
            });
          }
        } else if (hostingProfile) {
          profile = hostingProfile;
          mode = "hosting";
        } else {
          throw new Error("Profile not found");
        }

        // Set initial form data
        setInitialFormData({
          profileName: profile.name,
          serverAddress: profile.server,
          protocol: profile.protocol,
          mode,
          profileId: existingProfileId,
        });

        // Set other form data if available
        if (profile.hub_settings) {
          setHubFormData(profile.hub_settings);
        }

        if (profile.afk_settings) {
          setAFKFormData(profile.afk_settings);
        }

        if (profile.reconnect_settings) {
          setReconnectFormData(profile.reconnect_settings);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExistingProfile();
  }, [existingProfileId]);

  // Save profile to database
  const saveProfile = async (): Promise<{
    success: boolean;
    profileId?: string;
  }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const profileData: ProfileData = {
        id: initialFormData.profileId, // Include ID if editing existing profile
        name: initialFormData.profileName,
        server: initialFormData.serverAddress,
        protocol: initialFormData.protocol,
        user_id: userData.user.id,
        hub_settings: hubFormData,
        afk_settings: afkFormData,
        reconnect_settings: reconnectFormData,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (initialFormData.mode === "voting") {
        result = await saveVotingProfile(profileData);
      } else {
        result = await saveHostingProfile(profileData);
      }

      if (result.error) {
        throw result.error;
      }

      const savedProfileId = result.data?.[0]?.id;

      // If this is a voting profile, save the Microsoft accounts
      if (initialFormData.mode === "voting" && savedProfileId) {
        // First, get existing accounts for this profile to determine which ones to delete
        const { data: existingAccounts } =
          await getMicrosoftAccounts(savedProfileId);
        const existingAccountIds = new Set(
          existingAccounts?.map((acc) => acc.id) || [],
        );
        const currentAccountIds = new Set(
          accountsFormData.accounts.map((acc) => acc.id),
        );

        // Delete accounts that are no longer in the form data
        for (const id of existingAccountIds) {
          if (!currentAccountIds.has(id)) {
            await deleteMicrosoftAccount(id);
          }
        }

        // Save/update current accounts
        for (const account of accountsFormData.accounts) {
          if (account.refreshToken) {
            await saveMicrosoftAccount(
              {
                id: account.id,
                username: account.username,
                refreshToken: account.refreshToken,
                accessToken: account.accessToken || "",
                expiresAt: account.expiresAt || 0,
              } as MicrosoftAccount,
              savedProfileId,
            );
          }
        }
      }

      toast({
        title: "Success",
        description: initialFormData.profileId
          ? "Profile updated successfully"
          : "Profile created successfully",
      });

      return { success: true, profileId: savedProfileId };
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile");
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    initialFormData,
    setInitialFormData,
    accountsFormData,
    setAccountsFormData,
    hubFormData,
    setHubFormData,
    afkFormData,
    setAFKFormData,
    reconnectFormData,
    setReconnectFormData,
    saveProfile,
    loading,
    error,
  };
};
