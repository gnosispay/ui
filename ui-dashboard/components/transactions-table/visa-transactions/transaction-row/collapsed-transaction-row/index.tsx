import { Disclosure } from "@headlessui/react";
import React from "react";

import { type Event } from "@gnosispay/types";
import { classNames } from "@/lib/utils";

import MccIcon from "../../../../mcc-icon";
import TransactionActions from "../../transaction-actions";
import { getTransactionDeclineReason } from "../lib";
import { TransactionAmount } from "./transaction-amount";
import { TransactionDate } from "./transaction-date";
import { TransactionStatusBadge } from "./transaction-status-badge";

interface CollapsedTransactionRowProps {
  showDate: boolean;
  transaction: Event;
  isDeclined: boolean;
  isRefundOrReversal: boolean;
}

export const CollapsedTransactionRow = ({
  showDate,
  transaction,
  isDeclined,
  isRefundOrReversal,
}: CollapsedTransactionRowProps) => {
  return (
    <Disclosure.Button as={React.Fragment}>
      {({ open }) => (
        <tr
          className={classNames(
            open && "bg-gp-sand",
            "hover:cursor-pointer hover:bg-gp-sand [&:first-child]:border-t",
          )}
        >
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium sm:pl-2">
            <TransactionDate
              date={new Date(transaction.createdAt)}
              showDate={showDate}
              open={open}
            />
          </td>

          <td className="py-4 pl-3 pr-4 sm:pr-0 border-t">
            <MccIcon
              className="h-5 w-5 text-gp-icon-active"
              mcc={transaction.mcc}
            />
          </td>

          <td className="whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t">
            {transaction.merchant.name}

            {isDeclined && (
              <>
                {" "}
                -{" "}
                <span className="text-gp-text-lc">
                  {getTransactionDeclineReason(transaction)}
                </span>
              </>
            )}

            {transaction.isPending && <TransactionStatusBadge type="pending" />}

            {isRefundOrReversal && <TransactionStatusBadge type="refund" />}
          </td>

          <td className="whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-right">
            <TransactionAmount
              transaction={transaction}
              isDeclined={isDeclined}
            />
          </td>

          <td className="whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-center">
            <TransactionActions transaction={transaction} />
          </td>
        </tr>
      )}
    </Disclosure.Button>
  );
};
