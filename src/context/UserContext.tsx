import { getApiV1SafeConfig, getApiV1User, type SafeConfig, type User } from "@/client";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type UserContextProps = {
  children: ReactNode | ReactNode[];
};

export type IUserContext = {
  user: User | undefined;
  safeConfig: SafeConfig | undefined;
};

const UserContext = createContext<IUserContext | undefined>(undefined);

const UserContextProvider = ({ children }: UserContextProps) => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<IUserContext["user"]>(undefined);
  const [safeConfig, setSafeConfig] = useState<IUserContext["safeConfig"]>(undefined);

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

  return <UserContext.Provider value={{ user, safeConfig }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser() must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser };
