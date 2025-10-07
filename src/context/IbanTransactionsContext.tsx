import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupByDate } from "@/utils/transactionUtils";
import type { IbanOrder } from "@/client";
import { getApiV1IbansOrders } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { useUser } from "./UserContext";

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
  const { isOnboarded } = useUser();
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
      const groupedTransactions = groupByDate(data.data);

      setIbanTransactionsByDate(groupedTransactions);
    }

    setIbanTransactionsLoading(false);
  }, []);

  useEffect(() => {
    if (!isOnboarded) {
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
  }, [fetchIbanTransactions, isOnboarded]);

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
