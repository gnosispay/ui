import {
  type Card,
  getApiV1Cards,
  getApiV1CardsByCardIdStatus,
  getApiV1SafeConfig,
  getApiV1User,
  type SafeConfig,
  type User,
} from "@/client";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type UserContextProps = {
  children: ReactNode | ReactNode[];
};

interface CardInfo {
  activatedAt?: string;
  statusCode: number;
  isFrozen: boolean;
  isStolen: boolean;
  isLost: boolean;
  isBlocked: boolean;
  isVoid: boolean;
}

type CardInfoMap = Record<string, CardInfo>;

export type IUserContext = {
  user: User | undefined;
  safeConfig: SafeConfig | undefined;
  cards: Card[] | undefined;
  cardInfoMap: CardInfoMap | undefined;
};

const UserContext = createContext<IUserContext | undefined>(undefined);

const UserContextProvider = ({ children }: UserContextProps) => {
  const [user, setUser] = useState<IUserContext["user"]>();
  const { isAuthenticated } = useAuth();
  const [safeConfig, setSafeConfig] = useState<IUserContext["safeConfig"]>();
  const [cards, setCards] = useState<IUserContext["cards"]>();
  const [cardInfoMap, setCardInfoMap] = useState<IUserContext["cardInfoMap"]>();

  useEffect(() => {
    if (!isAuthenticated || !cards || !cards.length) return;

    const newMap: CardInfoMap = {};
    for (const card of cards || []) {
      getApiV1CardsByCardIdStatus({
        path: {
          cardId: card.id,
        },
      }).then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        if (!data) {
          console.error("Card status: No data returned for card", card);
          return;
        }

        console.log("Card status data: ", card.id, data);
        newMap[card.id] = data;
      });

      setCardInfoMap(newMap);
    }
  }, [cards, isAuthenticated]);

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

    getApiV1Cards()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        setCards(data);
      })
      .catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    getApiV1SafeConfig()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        setSafeConfig(data);
      })
      .catch(console.error);
  }, []);

  return <UserContext.Provider value={{ user, safeConfig, cards, cardInfoMap }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser() must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser };
