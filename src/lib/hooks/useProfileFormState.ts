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

  const [accountsFormData, setAccountsFormData] = useState<AccountsFormData>({
    accounts: [],
  });

  const [hubFormData, setHubFormData] = useState<HubFormData>({
    setting: "none",
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
