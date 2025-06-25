import {
  type Card,
  getApiV1Cards,
  getApiV1CardsByCardIdStatus,
  getApiV1Transactions,
  getApiV1IbansOrders,
  postApiV1CardsByCardIdActivate,
  postApiV1CardsByCardIdFreeze,
  postApiV1CardsByCardIdLost,
  postApiV1CardsByCardIdStolen,
  postApiV1CardsByCardIdUnfreeze,
  type Event,
  type IbanOrder,
} from "@/client";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { fetchErc20Transfers } from "@/lib/fetchErc20Transfers";
import type { Erc20TokenEvent } from "@/types/transaction";
import type { Address } from "viem";

type CardContextProps = {
  children: ReactNode | ReactNode[];
};

export interface CardInfo {
  cardToken?: string;
  activatedAt?: string;
  statusCode: number;
  isFrozen: boolean;
  isStolen: boolean;
  isLost: boolean;
  isBlocked: boolean;
  isVoid: boolean;
}

type CardInfoMap = Record<string, CardInfo>;

interface GetTxParams {
  cardTokens?: string[];
  fromDate?: string;
}

interface GetOnchainTransfersParams {
  address: Address;
  tokenAddress: Address;
  fromDate?: string;
  skipSettlementTransfers: boolean;
}

export type ICardContext = {
  cards: Card[] | undefined;
  cardInfoMap: CardInfoMap | undefined;
  refreshCards: () => void;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
  markCardAsStolen: (cardId: string) => void;
  markCardAsLost: (cardId: string) => void;
  activateCard: (cardId: string) => void;
  getTransactions: (params?: GetTxParams) => Promise<Event[] | undefined>;
  getIbanOrders: () => Promise<IbanOrder[] | undefined>;
  getOnchainTransfers: (params: GetOnchainTransfersParams) => Promise<Erc20TokenEvent[] | undefined>;
};

const CardsContext = createContext<ICardContext | undefined>(undefined);

const CardsContextProvider = ({ children }: CardContextProps) => {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<ICardContext["cards"]>(undefined);
  const [cardInfoMap, setCardInfoMap] =
    useState<ICardContext["cardInfoMap"]>(undefined);

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

      newMap[card.id] = { cardToken: card.cardToken, ...data };
    }

    setCardInfoMap(newMap);
  }, []);

  const freezeCard = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdFreeze({
      path: {
        cardId,
      },
    })
      .then(({ error }) => {
        if (error) {
          console.error("Error freezing card: ", error);
          toast.error(
            <CollapsedError title="Error freezing card" error={error} />
          );
          return;
        }

        toast.success("Card frozen successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error freezing card: ", error);
        toast.error(
          <CollapsedError title="Error freezing card" error={error} />
        );
      });
  }, []);

  const unfreezeCard = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdUnfreeze({
      path: {
        cardId,
      },
    })
      .then(({ error }) => {
        if (error) {
          console.error("Error unfreezing card: ", error);
          toast.error(
            <CollapsedError title="Error unfreezing card" error={error} />
          );
          return;
        }

        toast.success("Card unfrozen successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error unfreezing card: ", error);
        toast.error(
          <CollapsedError title="Error unfreezing card" error={error} />
        );
      });
  }, []);

  const markCardAsStolen = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdStolen({
      path: {
        cardId,
      },
    })
      .then(({ error }) => {
        if (error) {
          console.error("Error marking card as stolen: ", error);
          toast.error(
            <CollapsedError
              title="Error marking card as stolen"
              error={error}
            />
          );
          return;
        }

        toast.success("Card marked as stolen successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error marking card as stolen: ", error);
        toast.error(
          <CollapsedError title="Error marking card as stolen" error={error} />
        );
      });
  }, []);

  const markCardAsLost = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdLost({
      path: {
        cardId,
      },
    })
      .then(({ error }) => {
        if (error) {
          console.error("Error marking card as lost: ", error);
          toast.error(
            <CollapsedError title="Error marking card as lost" error={error} />
          );
          return;
        }

        toast.success("Card marked as lost successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error marking card as lost: ", error);
        toast.error(
          <CollapsedError title="Error marking card as lost" error={error} />
        );
      });
  }, []);

  const activateCard = useCallback(async (cardId: string) => {
    postApiV1CardsByCardIdActivate({
      path: { cardId },
    })
      .then(({ error }) => {
        if (error) {
          console.error("Error activating card: ", error);
          toast.error(
            <CollapsedError title="Error activating card" error={error} />
          );
          return;
        }
        toast.success("Card activated successfully");
        refreshCards();
      })
      .catch((error) => {
        toast.error(
          <CollapsedError title="Error activating card" error={error} />
        );
        console.error("Error activating card:", error);
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

  const getTransactions = useCallback(
    async ({ cardTokens, fromDate }: GetTxParams = {}) => {
      const { data, error } = await getApiV1Transactions({
        query: {
          cardTokens: cardTokens?.join(","),
          after: fromDate,
        },
      });

      if (error) {
        console.error("Error getting transactions: ", error);
        return;
      }

      return data;
    },
    []
  );

  const getIbanOrders = useCallback(async () => {
    const { data, error } = await getApiV1IbansOrders();

    if (error) {
      console.error("Error getting IBAN orders: ", error);
      return;
    }

    return data?.data;
  }, []);

  const getIbanOrders = useCallback(async () => {
    const { data, error } = await getApiV1IbansOrders();

    if (error) {
      console.error("Error getting IBAN orders: ", error);
      return;
    }

    return data?.data;
  }, []);

  const getOnchainTransfers = useCallback(
    async ({ address, tokenAddress, fromDate, skipSettlementTransfers }: GetOnchainTransfersParams) => {
      const { data, error } = await fetchErc20Transfers({
        address,
        tokenAddress,
        fromDate,
        skipSettlementTransfers,
      });

      if (error) {
        console.error("Error getting onchain Safe transfers: ", error);
        return;
      }

      return data;
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCards();
  }, [isAuthenticated, refreshCards]);

  return (
    <CardsContext.Provider
      value={{
        cards,
        cardInfoMap,
        refreshCards,
        freezeCard,
        unfreezeCard,
        markCardAsLost,
        markCardAsStolen,
        activateCard,
        getTransactions,
        getIbanOrders,
        getOnchainTransfers,
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
