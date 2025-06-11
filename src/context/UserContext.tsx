import {
  getApiV1AccountBalances,
  type GetApiV1AccountBalancesResponse,
  getApiV1SafeConfig,
  getApiV1User,
  type SafeConfig,
  type User,
} from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type UserContextProps = {
  children: ReactNode | ReactNode[];
};

export type IUserContext = {
  user: User | undefined;
  safeConfig: SafeConfig | undefined;
  balances: GetApiV1AccountBalancesResponse | undefined;
};

const UserContext = createContext<IUserContext | undefined>(undefined);

const UserContextProvider = ({ children }: UserContextProps) => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<IUserContext["user"]>(undefined);
  const [safeConfig, setSafeConfig] = useState<IUserContext["safeConfig"]>(undefined);
  const [balances, setBalance] = useState<IUserContext["balances"]>(undefined);
  useEffect(() => {
    if (!isAuthenticated) return;

    getApiV1User()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        setUser(data);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

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

  return <UserContext.Provider value={{ user, safeConfig, balances: balances }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser() must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser };
