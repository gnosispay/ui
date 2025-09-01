import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupByCardToken, groupByDate } from "@/utils/transactionUtils";
import type { Event } from "@/client";
import { useAuth } from "./AuthContext";
import { getApiV1CardsTransactions } from "@/client";
import { useCards } from "./CardsContext";
import { extractErrorMessage } from "@/utils/errorHelpers";

export const DEFAULT_CARD_TRANSACTIONS_AMOUNT = 100;

type CardTransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

type CardTransactionsMap = Record<string, Record<string, Event[]>>;

export type ICardTransactionsContext = {
  cardTransactionsByTokenDate: CardTransactionsMap;
  cardTransactionsByDate: Record<string, Event[]>;
  cardTransactionsLoading: boolean;
  cardTransactionsError: string;
};

const CardTransactionsContext = createContext<ICardTransactionsContext | undefined>(undefined);

const CardTransactionsContextProvider = ({ children }: CardTransactionsContextProps) => {
  const { isAuthenticated } = useAuth();
  const { cards } = useCards();
  const cardTokens = useMemo(
    () => cards?.map((card) => card.cardToken).filter((token): token is string => Boolean(token)),
    [cards],
  );
  const [cardTransactionsByDate, setCardTransactionsByDate] = useState<Record<string, Event[]>>({});
  // transactions grouped by card token and date
  const [cardTransactionsByTokenDate, setCardTransactionsByTokenDate] = useState<CardTransactionsMap>({});
  const [cardTransactionsLoading, setCardTransactionsLoading] = useState(true);
  const [cardTransactionsError, setCardTransactionsError] = useState("");

  // since there is no card info in the general transactions endpoint, we need to fetch the transactions for each card separately
  const fetchCardTransactions = useCallback(async (cardTokens: string[]) => {
    setCardTransactionsLoading(true);
    setCardTransactionsError("");

    if (!cardTokens || cardTokens.length === 0) {
      return;
    }

    getApiV1CardsTransactions({
      query: {
        limit: 100,
      },
    })
      .then(({ data, error }) => {
        if (error) {
          setCardTransactionsError(extractErrorMessage(error, "Error fetching transactions by card"));
          console.error("Error fetching transactions by card:", error);
        } else {
          setCardTransactionsByDate(groupByDate(data.results || []));
          const txsByCard = groupByCardToken(data.results || []);
          const cardTransactionsMap: CardTransactionsMap = Object.entries(txsByCard).reduce((acc, [cardToken, txs]) => {
            acc[cardToken] = groupByDate(txs);
            return acc;
          }, {} as CardTransactionsMap);
          setCardTransactionsByTokenDate(cardTransactionsMap);
        }
      })
      .catch((error) => {
        setCardTransactionsError(extractErrorMessage(error, "Error fetching transactions by card"));
        console.error("Error fetching transactions by card:", error);
      })
      .finally(() => {
        setCardTransactionsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !cardTokens || cardTokens.length === 0) {
      return;
    }

    // Initial fetch
    fetchCardTransactions(cardTokens);

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchCardTransactions(cardTokens);
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [cardTokens, fetchCardTransactions, isAuthenticated]);

  const contextValue = useMemo(
    () => ({
      cardTransactionsByTokenDate,
      cardTransactionsByDate,
      cardTransactionsLoading,
      cardTransactionsError,
    }),
    [cardTransactionsByTokenDate, cardTransactionsByDate, cardTransactionsLoading, cardTransactionsError],
  );

  return <CardTransactionsContext.Provider value={contextValue}>{children}</CardTransactionsContext.Provider>;
};

const useCardTransactions = () => {
  const context = useContext(CardTransactionsContext);
  if (context === undefined) {
    throw new Error("useCardTransactions must be used within a CardTransactionsContextProvider");
  }
  return context;
};

export { CardTransactionsContextProvider, useCardTransactions };
