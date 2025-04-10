import { useState } from "react";

export interface InitialFormData {
  profileName: string;
  serverAddress: string;
  protocol: string;
  mode: string;
}

export interface AccountsFormData {
  accounts: Array<{
    id: string;
    username: string;
  }>;
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

export const useProfileFormState = () => {
  const [initialFormData, setInitialFormData] = useState<InitialFormData>({
    profileName: "",
    serverAddress: "",
    protocol: "auto",
    mode: "voting",
  });

  const [accountsFormData, setAccountsFormData] = useState<AccountsFormData>(
    () => {
      // Try to load saved accounts from localStorage
      const saved = localStorage.getItem("profile_accounts");
      return saved ? JSON.parse(saved) : { accounts: [] };
    },
  );

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
  };
};
