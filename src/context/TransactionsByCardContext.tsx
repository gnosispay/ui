import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCardTransactionsFromCardEvents, groupByDate } from "@/utils/transactionUtils";
import { formatISO, subDays } from "date-fns";
import type { Transaction } from "@/types/transaction";
import { useAuth } from "./AuthContext";
import { getApiV1Transactions } from "@/client";
import { useCards } from "./CardsContext";
import { extractErrorMessage } from "@/utils/errorHelpers";

export const DEFAULT_CARD_TRANSACTIONS_HISTORY = 30;

type TransactionsByCardContextProps = {
  children: ReactNode | ReactNode[];
};

interface GetTxsByCardParams {
  cardToken?: string;
  fromDate?: string;
}

type TransactionsByCardMap = Record<string, Record<string, Transaction[]>>;

export type ITransactionsByCardContext = {
  transactionsByCard: TransactionsByCardMap;
  transactionsByCardLoading: boolean;
  transactionsByCardError: string;
};

const TransactionsByCardContext = createContext<ITransactionsByCardContext | undefined>(undefined);

const TransactionsByCardContextProvider = ({ children }: TransactionsByCardContextProps) => {
  const { isAuthenticated } = useAuth();
  const { cards } = useCards();
  const cardTokens = useMemo(
    () => cards?.map((card) => card.cardToken).filter((token): token is string => Boolean(token)),
    [cards],
  );
  const [transactionsByCard, setTransactionsByCard] = useState<TransactionsByCardMap>({});
  const [transactionsByCardLoading, setTransactionsByCardLoading] = useState(true);
  const [transactionsByCardError, setTransactionsByCardError] = useState("");

  const getTransactionsByCard = useCallback(async ({ cardToken, fromDate }: GetTxsByCardParams) => {
    if (!cardToken) {
      return;
    }

    const { data, error } = await getApiV1Transactions({
      query: {
        cardTokens: cardToken,
        after: fromDate,
      },
    });

    if (error) {
      console.error("Error getting transactions: ", error);
      return;
    }

    return data;
  }, []);

  // since there is no card info in the general transactions endpoint, we need to fetch the transactions for each card separately
  const fetchTransactionsByCard = useCallback(
    async (cardTokens: string[], history = DEFAULT_CARD_TRANSACTIONS_HISTORY) => {
      setTransactionsByCardLoading(true);
      setTransactionsByCardError("");

      if (!cardTokens || cardTokens.length === 0) {
        return;
      }

      const fromDate = formatISO(subDays(new Date(), history));

      try {
        const promises = cardTokens.map((cardToken) => getTransactionsByCard({ cardToken, fromDate }));

        const results = await Promise.all(promises);

        const cardTransactionsMap: TransactionsByCardMap = {};

        results.forEach((result, index) => {
          const cardToken = cardTokens[index];
          if (result && cardToken) {
            const cardsTxs = getCardTransactionsFromCardEvents(result);
            cardTransactionsMap[cardToken] = groupByDate(cardsTxs);
          }
        });

        setTransactionsByCard(cardTransactionsMap);
      } catch (error) {
        setTransactionsByCardError(extractErrorMessage(error, "Error fetching transactions by card"));
        console.error("Error fetching transactions by card:", error);
      } finally {
        setTransactionsByCardLoading(false);
      }
    },
    [getTransactionsByCard],
  );

  useEffect(() => {
    if (!isAuthenticated || !cardTokens || cardTokens.length === 0) {
      return;
    }

    // Initial fetch
    fetchTransactionsByCard(cardTokens, DEFAULT_CARD_TRANSACTIONS_HISTORY);

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchTransactionsByCard(cardTokens, DEFAULT_CARD_TRANSACTIONS_HISTORY);
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [cardTokens, fetchTransactionsByCard, isAuthenticated]);

  return (
    <TransactionsByCardContext.Provider
      value={{ transactionsByCard, transactionsByCardLoading, transactionsByCardError }}
    >
      {children}
    </TransactionsByCardContext.Provider>
  );
};

const useTransactionsByCard = () => {
  const context = useContext(TransactionsByCardContext);
  if (context === undefined) {
    throw new Error("useTransactionsByCard must be used within a TransactionsByCardContextProvider");
  }
  return context;
};

export { TransactionsByCardContextProvider, useTransactionsByCard };
