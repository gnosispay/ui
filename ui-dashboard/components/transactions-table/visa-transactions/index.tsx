import { CreditCard } from "@phosphor-icons/react/dist/ssr";

import TransactionsEmptyState from "../transactions-empty-state";
import { TransactionRow } from "./transaction-row";
import type { Event } from "@gnosispay/types";

const isNewDate = (transactions: Event[], idx: number) => {
  const prevTransaction = idx === 0 ? null : transactions.at(idx - 1);
  const currentTransaction = transactions.at(idx);

  const newDate =
    String(prevTransaction?.createdAt).split("T")?.[0] !==
    String(currentTransaction?.createdAt).split("T")?.[0];

  return newDate;
};

export default function TransactionsTable({
  transactions,
}: {
  transactions: Event[] | undefined | null;
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <TransactionsEmptyState
        Icon={CreditCard}
        title="Congratulations!"
        description={
          <>
            Your Gnosis Card is ready to use! <br /> <br />
            Your first transaction needs to be made by
            <br />
            inserting the card at a merchant terminal.
          </>
        }
      />
    );
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-scroll md:overflow-visible sm:-mx-6 lg:-mx-8 pb-16 md:pb-0 scrollbar-hidden">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-xs font-normal text-gp-text-lc sm:pl-2 w-[150px]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-0 w-[50px]"
                >
                  <span className="sr-only">Category</span>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs font-normal text-gp-text-lc"
                >
                  Merchant
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-xs font-normal text-gp-text-lc"
                >
                  Amount
                </th>

                {/* Used for transaction actions (dispute & report) */}
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) &&
                transactions.map((transaction, idx) => (
                  <TransactionRow
                    key={idx}
                    transaction={transaction}
                    showDate={isNewDate(transactions, idx)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
