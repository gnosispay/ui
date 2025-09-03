import { type Event } from "@gnosispay/types";

import FormatCurrency from "../../../../format-currency";

interface TransactionAmountProps {
  transaction: Event;
  isDeclined: boolean;
}
export const TransactionAmount = ({
  transaction,
  isDeclined,
}: TransactionAmountProps) => (
  <span className="relative">
    <FormatCurrency
      currency={transaction.billingCurrency.symbol}
      decimals={transaction.billingCurrency.decimals}
      amount={transaction.billingAmount}
    />

    {isDeclined && (
      <div className="absolute left-0 top-[50%] h-[1.5px] w-full bg-gp-text-hc" />
    )}
  </span>
);
