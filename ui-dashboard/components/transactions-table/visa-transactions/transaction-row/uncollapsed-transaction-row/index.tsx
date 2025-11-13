import { Disclosure } from "@headlessui/react";

import { TransactionCurrencyConversion } from "./transaction-currency-conversion";
import { TransactionDetails } from "./transaction-details";
import type { Event } from "@gnosispay/types";

interface UncollapsedTransactionRowProps {
  transaction: Event;
  isDeclined: boolean;
  isRefundOrReversal: boolean;
}

export const UncollapsedTransactionRow = ({
  transaction,
  isDeclined,
  isRefundOrReversal,
}: UncollapsedTransactionRowProps) => {
  return (
    <Disclosure.Panel as="tr" className="bg-gp-sand">
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"></td>
      <td
        className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-0"
        colSpan={5}
      >
        <div className="flex justify-between">
          <div className="flex justify-between">
            <TransactionDetails
              transaction={transaction}
              isDeclined={isDeclined}
              isRefundOrReversal={isRefundOrReversal}
            />
          </div>

          <TransactionCurrencyConversion transaction={transaction} />
        </div>
      </td>
    </Disclosure.Panel>
  );
};
