import type { IbanOrder } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { BankTransferRow } from "./bank-transfer-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useIbanTransactions } from "@/context/IbanTransactionsContext";
import { useMemo } from "react";

export const IbanTransactions = () => {
  const { ibanTransactionsByDate, ibanTransactionsLoading, ibanTransactionsError } = useIbanTransactions();

  const transactionsByDate = useMemo(() => ibanTransactionsByDate, [ibanTransactionsByDate]);

  if (ibanTransactionsLoading) {
    return <TransactionSkeleton />;
  }

  if (ibanTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <>
      {Object.keys(transactionsByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">No IBAN transactions to display</div>
        </div>
      )}

      {Object.keys(transactionsByDate).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2 p-2">{date}</div>
          {(transactionsByDate as Record<string, IbanOrder[]>)[date].map((ibanOrder: IbanOrder) => {
            return <BankTransferRow key={ibanOrder.id} ibanOrder={ibanOrder} />;
          })}
        </div>
      ))}
    </>
  );
};
