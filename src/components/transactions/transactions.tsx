import type { Event } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useCardTransactions } from "@/context/CardTransactionsContext";

interface TransactionsProps {
  withIban?: boolean;
  withOnchain?: boolean;
}

export const Transactions = () => {
  const { safeConfig } = useUser();
  const { cardTransactionsByDate, cardTransactionsLoading, cardTransactionsError } = useCardTransactions();

  // const {
  //   isLoading,
  //   isError,
  //   filteredTransactions: transactions,
  // } = useFilteredTransactions({
  //   withIban,
  //   withOnchain,
  // });

  if (!safeConfig || cardTransactionsLoading || !cardTransactionsByDate) {
    return <TransactionSkeleton />;
  }
  if (cardTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card rounded-xl p-2">
      {Object.keys(cardTransactionsByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">No card transactions to display</div>
        </div>
      )}
      {Object.keys(cardTransactionsByDate).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2 p-2">{date}</div>

          {cardTransactionsByDate[date].map((tx: Event) => {
            const id = `${tx.createdAt}${tx.merchant?.name || ""}${tx.kind}`;
            // if (transaction.type === TransactionType.CARD) {
            return <TransactionRow key={id} transaction={tx} />;
            // }

            // if (transaction.type === TransactionType.IBAN) {
            //   return <BankTransferRow key={transaction.id} ibanOrder={transaction.data as IbanOrder} />;
            // }

            // if (transaction.type === TransactionType.ONCHAIN && !!safeConfig.fiatSymbol) {
            //   const currency = currencies[safeConfig.fiatSymbol];
            //   return (
            //     <OnchainTransferRow
            //       key={transaction.id}
            //       transfer={transaction.data as Erc20TokenEvent}
            //       currency={currency}
            //     />
            //   );
            // }

            // return null;
          })}
        </div>
      ))}
    </div>
  );
};
