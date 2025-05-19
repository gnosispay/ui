import {
  type Card,
  getApiV1Cards,
  getApiV1CardsByCardIdStatus,
  postApiV1CardsByCardIdFreeze,
  postApiV1CardsByCardIdUnfreeze,
} from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type CardContextProps = {
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

export type ICardContext = {
  cards: Card[] | undefined;
  cardInfoMap: CardInfoMap | undefined;
  refreshCards: () => void;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
};

const CardsContext = createContext<ICardContext | undefined>(undefined);

const CardsContextProvider = ({ children }: CardContextProps) => {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<ICardContext["cards"]>(undefined);
  const [cardInfoMap, setCardInfoMap] = useState<ICardContext["cardInfoMap"]>(undefined);

  const setCardsInfo = useCallback(async (cards: Card[]) => {
    const newMap: CardInfoMap = {};

    for (const card of cards || []) {
      const { data, error } = await getApiV1CardsByCardIdStatus({
        path: {
          cardId: card.id,
        },
      });
      if (error) {
        console.error(error);
        return;
      }

      if (!data) {
        console.error("Card status: No data returned for card", card);
        toast.error(`Card status: No data returned for card ${card.id}`);
        return;
      }

      console.log("Card status data: ", card.id, data);
      newMap[card.id] = data;
    }

    setCardInfoMap(newMap);
  }, []);

  const freezeCard = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdFreeze({
      path: {
        cardId,
      },
    })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error freezing card: ", error);
          toast.error(`Error freezing card ${error}`);
          return;
        }

        console.log("Card freeze data: ", data);
        toast.success("Card frozen successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error freezing card: ", error);
        toast.error(`Error freezing card ${error}`);
      });
  }, []);

  const unfreezeCard = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdUnfreeze({
      path: {
        cardId,
      },
    })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error unfreezing card: ", error);
          toast.error(`Error unfreezing card ${error}`);
          return;
        }

        console.log("Card unfreeze data: ", data);
        toast.success("Card unfrozen successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error unfreezing card: ", error);
        toast.error(`Error unfreezing card ${error}`);
      });
  }, []);

  const refreshCards = useCallback(() => {
    setCards(undefined);

    getApiV1Cards()
      .then(async ({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        if (!data) {
          console.error("No cards data returned");
          return;
        }

        await setCardsInfo(data);
        setCards(data);
      })
      .catch(console.error);
  }, [setCardsInfo]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCards();
  }, [isAuthenticated, refreshCards]);

  return (
    <CardsContext.Provider value={{ cards, cardInfoMap, refreshCards, freezeCard, unfreezeCard }}>
      {children}
    </CardsContext.Provider>
  );
};

const useCards = () => {
  const context = useContext(CardsContext);
  if (context === undefined) {
    throw new Error("useCards() must be used within a CardContextProvider");
  }
  return context;
};

export { CardsContextProvider, useCards };
