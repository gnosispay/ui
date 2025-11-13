import { Disclosure } from "@headlessui/react";

import { CollapsedTransactionRow } from "./collapsed-transaction-row";
import { UncollapsedTransactionRow } from "./uncollapsed-transaction-row";
import { isTransactionDeclined, isTransactionRefundOrReversal } from "./lib";
import type { Event } from "@gnosispay/types";

interface TransactionRowProps {
  transaction: Event;
  showDate: boolean;
}
export const TransactionRow = ({
  transaction,
  showDate,
}: TransactionRowProps) => {
  const isDeclined = isTransactionDeclined(transaction);
  const isRefundOrReversal = isTransactionRefundOrReversal(transaction);

  return (
    <Disclosure>
      <CollapsedTransactionRow
        transaction={transaction}
        showDate={showDate}
        isDeclined={isDeclined}
        isRefundOrReversal={isRefundOrReversal}
      />

      <UncollapsedTransactionRow
        transaction={transaction}
        isDeclined={isDeclined}
        isRefundOrReversal={isRefundOrReversal}
      />
    </Disclosure>
  );
};
