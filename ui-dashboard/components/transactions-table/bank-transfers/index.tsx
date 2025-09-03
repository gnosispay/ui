"use client";

import { Bank } from "@phosphor-icons/react/dist/ssr";
import TransactionsEmptyState from "../transactions-empty-state";
import { BankTransferRow } from "./bank-transfer-row";
import type { MoneriumIbanOrder } from "@gnosispay/types";

const isNewDate = (transactions: MoneriumIbanOrder[], idx: number) => {
  const prevTransaction = idx === 0 ? null : transactions.at(idx - 1);
  const currentTransaction = transactions.at(idx);

  const newDate =
    String(prevTransaction?.meta.placedAt).split("T")?.[0] !==
    String(currentTransaction?.meta.placedAt).split("T")?.[0];

  return newDate;
};

export const BankTransfers = ({
  moneriumIbanOrders,
}: {
  moneriumIbanOrders: MoneriumIbanOrder[];
}) => {
  if (!moneriumIbanOrders || moneriumIbanOrders.length === 0) {
    return (
      <TransactionsEmptyState
        Icon={Bank}
        title="No bank transfers yet"
        description={
          <>
            You haven&apos;t made any transfers with your current bank details
            yet.
            <br />
            Once you do, they will be displayed here.
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
              </tr>
            </thead>
            <tbody>
              {Array.isArray(moneriumIbanOrders) &&
                moneriumIbanOrders.map((moneriumIbanOrder, idx) => (
                  <BankTransferRow
                    key={idx}
                    moneriumIbanOrder={moneriumIbanOrder}
                    showDate={isNewDate(moneriumIbanOrders, idx)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
