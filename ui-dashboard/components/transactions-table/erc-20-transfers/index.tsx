import React from "react";
import { Coins } from "@phosphor-icons/react/dist/ssr";

import TransactionsEmptyState from "../transactions-empty-state";
import Erc20TransferRow from "./erc-20-transfer-row";
import type { Erc20TokenEvent } from "@gnosispay/types";

export default function Erc20TransfersTable({
  transactions,
  currencyName,
  tokenDecimals,
}: {
  transactions: Erc20TokenEvent[];
  currencyName?: string;
  tokenDecimals?: number;
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <TransactionsEmptyState
        Icon={Coins}
        title="No transactions yet"
        description={
          <>
            You haven&apos;t made any on chain transactions with your configured
            Safe wallet.
            <br />
            Once you start making {currencyName}e transfers they will appear
            here.
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
                  To/From
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-xs font-normal text-gp-text-lc"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) &&
                transactions.map((transaction, idx) => (
                  <Erc20TransferRow
                    key={idx}
                    transaction={transaction}
                    currencyName={currencyName}
                    tokenDecimals={tokenDecimals}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
