import {
  type Card,
  getApiV1Cards,
  getApiV1CardsByCardIdStatus,
  postApiV1CardsByCardIdActivate,
  postApiV1CardsByCardIdFreeze,
  postApiV1CardsByCardIdLost,
  postApiV1CardsByCardIdStolen,
  postApiV1CardsByCardIdUnfreeze,
} from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { useAuth } from "./AuthContext";

type CardContextProps = {
  children: ReactNode | ReactNode[];
};

export interface CardInfo extends Card {
  cardToken?: string;
  activatedAt?: string | null;
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
  isHideVoidedCards: boolean;
  setIsHideVoidedCards: (hide: boolean) => void;
  refreshCards: () => void;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
  markCardAsStolen: (cardId: string) => void;
  markCardAsLost: (cardId: string) => void;
  activateCard: (cardId: string) => void;
};

const CardsContext = createContext<ICardContext | undefined>(undefined);

const CardsContextProvider = ({ children }: CardContextProps) => {
  const [fetchedCards, setFetchedCards] = useState<ICardContext["cards"]>(undefined);
  const [cardInfoMap, setCardInfoMap] = useState<ICardContext["cardInfoMap"]>(undefined);
  const [isHideVoidedCards, setIsHideVoidedCards] = useState(true);
  const { isAuthenticated } = useAuth();

  const cards = useMemo(() => {
    if (!fetchedCards || !cardInfoMap) return undefined;

    if (!isHideVoidedCards) return fetchedCards;

    return fetchedCards.filter((card) => {
      const cardInfo = !!card.cardToken && cardInfoMap[card.cardToken];
      return !!cardInfo && !cardInfo.isVoid && !cardInfo.isLost && !cardInfo.isStolen;
    });
  }, [fetchedCards, cardInfoMap, isHideVoidedCards]);

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

      if (!card.cardToken) return;

      newMap[card.cardToken] = { ...card, ...data };
    }

    setCardInfoMap(newMap);
  }, []);

  const refreshCards = useCallback(() => {
    setFetchedCards(undefined);
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
        setFetchedCards(data);
      })
      .catch(console.error);
  }, [setCardsInfo]);

  const freezeCard = useCallback(
    async (cardId: string) => {
      postApiV1CardsByCardIdFreeze({
        path: {
          cardId,
        },
      })
        .then(({ error }) => {
          if (error) {
            console.error("Error freezing card: ", error);
            toast.error(<CollapsedError title="Error freezing card" error={error} />);
            return;
          }

          toast.success("Card frozen successfully");
          refreshCards();
        })
        .catch((error) => {
          console.error("Error freezing card: ", error);
          toast.error(<CollapsedError title="Error freezing card" error={error} />);
        });
    },
    [refreshCards],
  );

  const unfreezeCard = useCallback(
    async (cardId: string) => {
      postApiV1CardsByCardIdUnfreeze({
        path: {
          cardId,
        },
      })
        .then(({ error }) => {
          if (error) {
            console.error("Error unfreezing card: ", error);
            toast.error(<CollapsedError title="Error unfreezing card" error={error} />);
            return;
          }

          toast.success("Card unfrozen successfully");
          refreshCards();
        })
        .catch((error) => {
          console.error("Error unfreezing card: ", error);
          toast.error(<CollapsedError title="Error unfreezing card" error={error} />);
        });
    },
    [refreshCards],
  );

  const markCardAsStolen = useCallback(
    async (cardId: string) => {
      postApiV1CardsByCardIdStolen({
        path: {
          cardId,
        },
      })
        .then(({ error }) => {
          if (error) {
            console.error("Error marking card as stolen: ", error);
            toast.error(<CollapsedError title="Error marking card as stolen" error={error} />);
            return;
          }

          toast.success("Card marked as stolen successfully");
          refreshCards();
        })
        .catch((error) => {
          console.error("Error marking card as stolen: ", error);
          toast.error(<CollapsedError title="Error marking card as stolen" error={error} />);
        });
    },
    [refreshCards],
  );

  const markCardAsLost = useCallback(
    async (cardId: string) => {
      postApiV1CardsByCardIdLost({
        path: {
          cardId,
        },
      })
        .then(({ error }) => {
          if (error) {
            console.error("Error marking card as lost: ", error);
            toast.error(<CollapsedError title="Error marking card as lost" error={error} />);
            return;
          }

          toast.success("Card marked as lost successfully");
          refreshCards();
        })
        .catch((error) => {
          console.error("Error marking card as lost: ", error);
          toast.error(<CollapsedError title="Error marking card as lost" error={error} />);
        });
    },
    [refreshCards],
  );

  const activateCard = useCallback(
    async (cardId: string) => {
      postApiV1CardsByCardIdActivate({
        path: { cardId },
      })
        .then(({ error }) => {
          if (error) {
            console.error("Error activating card: ", error);
            toast.error(<CollapsedError title="Error activating card" error={error} />);
            return;
          }
          toast.success("Card activated successfully");
          refreshCards();
        })
        .catch((error) => {
          toast.error(<CollapsedError title="Error activating card" error={error} />);
          console.error("Error activating card:", error);
        });
    },
    [refreshCards],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCards();
  }, [refreshCards, isAuthenticated]);

  return (
    <CardsContext.Provider
      value={{
        cards,
        cardInfoMap,
        isHideVoidedCards,
        setIsHideVoidedCards,
        refreshCards,
        freezeCard,
        unfreezeCard,
        markCardAsLost,
        markCardAsStolen,
        activateCard,
      }}
    >
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
