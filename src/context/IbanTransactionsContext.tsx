import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupByDate } from "@/utils/transactionUtils";
import type { IbanOrder } from "@/client";
import { useAuth } from "./AuthContext";
import { getApiV1IbansOrders } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { subDays, isAfter, parseISO } from "date-fns";

export const DEFAULT_IBAN_TRANSACTIONS_DAYS = 30;

type IbanTransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

export type IIbanTransactionsContext = {
  ibanTransactionsByDate: Record<string, IbanOrder[]>;
  ibanTransactionsLoading: boolean;
  ibanTransactionsError: string;
};

const IbanTransactionsContext = createContext<IIbanTransactionsContext | undefined>(undefined);

const IbanTransactionsContextProvider = ({ children }: IbanTransactionsContextProps) => {
  const { isAuthenticated } = useAuth();
  const [ibanTransactionsByDate, setIbanTransactionsByDate] = useState<Record<string, IbanOrder[]>>({});
  const [ibanTransactionsLoading, setIbanTransactionsLoading] = useState(true);
  const [ibanTransactionsError, setIbanTransactionsError] = useState("");

  const fetchIbanTransactions = useCallback(async () => {
    setIbanTransactionsLoading(true);
    setIbanTransactionsError("");

    const { data, error } = await getApiV1IbansOrders();

    if (error) {
      setIbanTransactionsError(extractErrorMessage(error, "Error fetching IBAN transactions"));
      console.error("Error fetching IBAN transactions:", error);
    } else if (data?.data) {
      // Filter IBAN orders by the placement date (API doesn't support date filtering yet)
      const fromDate = subDays(new Date(), DEFAULT_IBAN_TRANSACTIONS_DAYS);
      const filteredOrders = data.data.filter((order) => isAfter(parseISO(order.meta.placedAt), fromDate));

      // Convert IbanOrder[] to Transaction[] format for groupByDate
      const transactionLikeData = filteredOrders.map((order) => ({
        id: order.id,
        createdAt: order.meta.placedAt,
        type: "iban" as const,
        data: order,
      }));

      const groupedTransactions = groupByDate(transactionLikeData);

      // Extract the IbanOrder data back out
      const groupedIbanTransactions = Object.entries(groupedTransactions).reduce(
        (acc, [date, transactions]) => {
          acc[date] = transactions.map((tx) => tx.data as IbanOrder);
          return acc;
        },
        {} as Record<string, IbanOrder[]>,
      );

      setIbanTransactionsByDate(groupedIbanTransactions);
    }

    setIbanTransactionsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIbanTransactionsByDate({});
      setIbanTransactionsLoading(false);
      return;
    }

    // Initial fetch
    fetchIbanTransactions();

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchIbanTransactions();
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchIbanTransactions, isAuthenticated]);

  const contextValue = useMemo(
    () => ({
      ibanTransactionsByDate,
      ibanTransactionsLoading,
      ibanTransactionsError,
    }),
    [ibanTransactionsByDate, ibanTransactionsLoading, ibanTransactionsError],
  );

  return <IbanTransactionsContext.Provider value={contextValue}>{children}</IbanTransactionsContext.Provider>;
};

const useIbanTransactions = () => {
  const context = useContext(IbanTransactionsContext);
  if (context === undefined) {
    throw new Error("useIbanTransactions must be used within a IbanTransactionsContextProvider");
  }
  return context;
};

export { IbanTransactionsContextProvider, useIbanTransactions };
