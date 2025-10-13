import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { groupByCardToken, groupByDate } from "@/utils/transactionUtils";
import type { Event } from "@/client";
import { getApiV1CardsTransactions } from "@/client";
import { useCards } from "./CardsContext";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { useUser } from "./UserContext";

// the lowest, the faster the initial load
export const DEFAULT_CARD_TRANSACTIONS_AMOUNT = 20;
export const LOAD_MORE_CARD_TRANSACTIONS_AMOUNT = 50;

type CardTransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

type CardTransactionsMap = Record<string, Record<string, Event[]>>;

export type ICardTransactionsContext = {
  cardTransactionsByTokenDate: CardTransactionsMap;
  cardTransactionsByDate: Record<string, Event[]>;
  cardTransactionsLoading: boolean;
  cardTransactionsError: string;
  hasNextPage: boolean;
  isLoadingMoreCardTransactions: boolean;
  loadMoreCardTransactions: () => void;
  transactionCount: number;
};

const CardTransactionsContext = createContext<ICardTransactionsContext | undefined>(undefined);

const CardTransactionsContextProvider = ({ children }: CardTransactionsContextProps) => {
  const { isOnboarded } = useUser();
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
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMoreCardTransactions, setIsLoadingMoreCardTransactions] = useState(false);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const currentOffsetRef = useRef(0);

  const fetchCardTransactions = useCallback(async (cardTokens: string[], isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMoreCardTransactions(true);
    } else {
      setCardTransactionsLoading(true);
      currentOffsetRef.current = 0;
      setLoadMoreCount(0); // Reset load more count on initial fetch
    }
    setCardTransactionsError("");

    if (!cardTokens || cardTokens.length === 0) {
      return;
    }

    // Use a ref to get the current offset to avoid dependency issues
    const offset = isLoadMore ? currentOffsetRef.current : 0;

    getApiV1CardsTransactions({
      query: {
        limit: isLoadMore ? LOAD_MORE_CARD_TRANSACTIONS_AMOUNT : DEFAULT_CARD_TRANSACTIONS_AMOUNT,
        offset,
      },
    })
      .then(({ data, error }) => {
        setHasNextPage(!!data?.next);
        if (error) {
          setCardTransactionsError(extractErrorMessage(error, "Error fetching transactions by card"));
          console.error("Error fetching transactions by card:", error);
        } else {
          const newTransactions = data.results || [];

          if (isLoadMore) {
            // Merge new transactions with existing ones
            setCardTransactionsByDate((prev) => {
              const combined = [...Object.values(prev).flat(), ...newTransactions];
              return groupByDate(combined);
            });

            setCardTransactionsByTokenDate((prev) => {
              const combined = [
                ...Object.values(prev).flatMap((dateGroups) => Object.values(dateGroups).flat()),
                ...newTransactions,
              ];
              const txsByCard = groupByCardToken(combined);
              const cardTransactionsMap: CardTransactionsMap = Object.entries(txsByCard).reduce(
                (acc, [cardToken, txs]) => {
                  acc[cardToken] = groupByDate(txs);
                  return acc;
                },
                {} as CardTransactionsMap,
              );
              return cardTransactionsMap;
            });
          } else {
            // Initial load - replace existing transactions
            setCardTransactionsByDate(groupByDate(newTransactions));
            const txsByCard = groupByCardToken(newTransactions);
            const cardTransactionsMap: CardTransactionsMap = Object.entries(txsByCard).reduce(
              (acc, [cardToken, txs]) => {
                acc[cardToken] = groupByDate(txs);
                return acc;
              },
              {} as CardTransactionsMap,
            );
            setCardTransactionsByTokenDate(cardTransactionsMap);
          }

          currentOffsetRef.current = offset + DEFAULT_CARD_TRANSACTIONS_AMOUNT;

          // Increment load more count if this was a load more operation
          if (isLoadMore) {
            setLoadMoreCount((prev) => prev + 1);
          }
        }
      })
      .catch((error) => {
        setCardTransactionsError(extractErrorMessage(error, "Error fetching transactions by card"));
        console.error("Error fetching transactions by card:", error);
      })
      .finally(() => {
        if (isLoadMore) {
          setIsLoadingMoreCardTransactions(false);
        } else {
          setCardTransactionsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!isOnboarded || !cardTokens) {
      return;
    }

    if (cardTokens.length === 0) {
      // prevent flashing of loading state
      setCardTransactionsLoading(false);
      return;
    }

    // Initial fetch
    fetchCardTransactions(cardTokens, false);

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchCardTransactions(cardTokens, false); // Always do initial fetch for periodic updates
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [cardTokens, fetchCardTransactions, isOnboarded]);

  const loadMoreCardTransactions = useCallback(() => {
    if (!cardTokens || cardTokens.length === 0 || !hasNextPage || isLoadingMoreCardTransactions) {
      return;
    }
    fetchCardTransactions(cardTokens, true);
  }, [cardTokens, hasNextPage, isLoadingMoreCardTransactions, fetchCardTransactions]);

  // Calculate total transactions loaded: initial load + (load more operations * load more amount)
  const transactionCount = useMemo(() => {
    return DEFAULT_CARD_TRANSACTIONS_AMOUNT + loadMoreCount * LOAD_MORE_CARD_TRANSACTIONS_AMOUNT;
  }, [loadMoreCount]);

  const contextValue = useMemo(
    () => ({
      cardTransactionsByTokenDate,
      cardTransactionsByDate,
      cardTransactionsLoading,
      cardTransactionsError,
      hasNextPage,
      isLoadingMoreCardTransactions,
      loadMoreCardTransactions,
      transactionCount,
    }),
    [
      cardTransactionsByTokenDate,
      cardTransactionsByDate,
      cardTransactionsLoading,
      cardTransactionsError,
      hasNextPage,
      isLoadingMoreCardTransactions,
      loadMoreCardTransactions,
      transactionCount,
    ],
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
