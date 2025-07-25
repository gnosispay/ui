import {
  getApiV1AccountBalances,
  type GetApiV1AccountBalancesResponse,
  getApiV1SafeConfig,
  getApiV1User,
  type SafeConfig,
  type User,
} from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { AccountIntegrityStatus } from "@gnosispay/account-kit";

type UserContextProps = {
  children: ReactNode | ReactNode[];
};

export type IUserContext = {
  user: User | undefined;
  safeConfig: SafeConfig | undefined;
  balances: GetApiV1AccountBalancesResponse | undefined;
  isUserSignedUp?: boolean;
  refreshUser: () => void;
  refreshSafeConfig: () => void;
  isKycApproved: boolean;
  isSafeConfigured: boolean;
};

const UserContext = createContext<IUserContext | undefined>(undefined);

const UserContextProvider = ({ children }: UserContextProps) => {
  const { isAuthenticated, jwtContainsUserId } = useAuth();
  const [user, setUser] = useState<IUserContext["user"]>(undefined);
  const [safeConfig, setSafeConfig] = useState<IUserContext["safeConfig"]>(undefined);
  const [balances, setBalance] = useState<IUserContext["balances"]>(undefined);
  const isUserSignedUp = useMemo(() => jwtContainsUserId, [jwtContainsUserId]);
  const [isKycApproved, setIsKycApproved] = useState(false);
  const [isSafeConfigured, setIsSafeConfigured] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isUserSignedUp || !user) return;
    setIsKycApproved(user.kycStatus === "approved");
  }, [isAuthenticated, isUserSignedUp, user]);

  useEffect(() => {
    if (
      safeConfig?.accountStatus === AccountIntegrityStatus.Ok ||
      safeConfig?.accountStatus === AccountIntegrityStatus.DelayQueueNotEmpty
    ) {
      setIsSafeConfigured(true);
    }
  }, [safeConfig]);

  useEffect(() => {
    if (!isAuthenticated || !isUserSignedUp) return;

    refreshUser();
  }, [isAuthenticated, isUserSignedUp]);

  useEffect(() => {
    if (!isAuthenticated || !isUserSignedUp) return;

    refreshSafeConfig();
  }, [isAuthenticated, isUserSignedUp]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Call immediately
    getAccountBalance();

    // Call every 30s
    const interval = setInterval(() => {
      getAccountBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const refreshSafeConfig = useCallback(() => {
    getApiV1SafeConfig()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        if (!data) {
          console.error("No safe config data returned");
          return;
        }

        setSafeConfig(data);
      })
      .catch(console.error);
  }, []);

  const refreshUser = useCallback(() => {
    if (!isAuthenticated || !isUserSignedUp) return;

    getApiV1User()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        setUser(data);
      })
      .catch(console.error);
  }, [isAuthenticated, isUserSignedUp]);

  const getAccountBalance = useCallback(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    getApiV1AccountBalances()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching account balances:", error);
          return;
        }

        if (!data) {
          console.warn("No balances found for the user");
          setBalance(undefined);
          return;
        }

        setBalance(data);
      })
      .catch((error) => {
        console.error("Error fetching account balances:", error);
      });
  }, [isAuthenticated, user]);

  return (
    <UserContext.Provider
      value={{
        user,
        safeConfig,
        balances,
        isUserSignedUp,
        refreshUser,
        refreshSafeConfig,
        isKycApproved,
        isSafeConfigured,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser() must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser };
