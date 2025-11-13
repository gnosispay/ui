"use client";
import { useState } from "react";
import { ListDashes } from "@phosphor-icons/react/dist/ssr";
import LinkWithTooltip from "../../profile/components/link-with-tooltip";
import { TransactionRow } from "./transaction-row";
import type { Erc20TokenEvent } from "@gnosispay/types";

const DEFAULT_NUMBER_OF_TRANSACTIONS = 5;

export const RecentTransactions = ({
  transactions,
}: {
  transactions: Erc20TokenEvent[];
}) => {
  const [numberOfVisibleTransactions, setNumberOfVisibleTransactions] =
    useState(DEFAULT_NUMBER_OF_TRANSACTIONS);

  const visibleTransactions = transactions.slice(
    0,
    numberOfVisibleTransactions,
  );
  return (
    <div className="bg-white shadow-sm flex-1 flex-col flex rounded-lg">
      <div className="flex justify-between items-center border-b border-tertiary p-4">
        <div className="text-lg flex gap-2 items-center justify-center">
          Reward transactions{" "}
          <LinkWithTooltip
            title="Cashback is calculated when payments are cleared, not when they're authorized, which might not be immediately visible. This can sometimes make it seem like certain transactions were missed. Rest assured, all eligible transactions will be included in the next cashback period. We apologize for any confusion and are actively working to improve this experience."
            classNames="w-44 md:w-64"
            link="https://help.gnosispay.com/en/articles/9791959-gno-cashback-how-it-works"
          />
        </div>
        {numberOfVisibleTransactions === DEFAULT_NUMBER_OF_TRANSACTIONS && (
          <a
            className="text-secondary cursor-pointer"
            onClick={() =>
              setNumberOfVisibleTransactions(numberOfVisibleTransactions + 5)
            }
          >
            See all
          </a>
        )}
      </div>
      {visibleTransactions.length > 0 ? (
        visibleTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.date + String(transaction.value)}
            transaction={transaction}
          />
        ))
      ) : (
        <div className="text-center flex-col gap-4 flex items-center justify-center p-8">
          <div className="rounded-full bg-bg-secondary p-2">
            <ListDashes className="w-6 h-6 text-secondary" />
          </div>
          <p>You have not received any rewards yet</p>
        </div>
      )}
    </div>
  );
};
