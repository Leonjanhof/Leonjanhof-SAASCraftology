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

  return {
    initialFormData,
    setInitialFormData,
    accountsFormData,
    setAccountsFormData,
  };
};
