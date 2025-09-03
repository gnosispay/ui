import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import FormatCurrency from "../../../../format-currency";
import {
  computeTransactionExchangeRate,
  formatTransactionExchangeRate,
} from "../lib";
import { TransactionExchangeRateTooltip } from "./transaction-exchange-rate-tooltip";
import type { Event } from "@gnosispay/types";

interface TransactionCurrencyConversionProps {
  transaction: Event;
}

export const TransactionCurrencyConversion = ({
  transaction,
}: TransactionCurrencyConversionProps) => {
  const isForeignPayment =
    transaction.billingCurrency.code !== transaction.transactionCurrency.code;

  const getFormattedExchangeRate = () => {
    const exchangeRate = computeTransactionExchangeRate({
      billingAmount: transaction.billingAmount,
      transactionAmount: transaction.transactionAmount,
    });

    return formatTransactionExchangeRate(exchangeRate);
  };

  if (!isForeignPayment) {
    return null;
  }

  return (
    <div className="-mr-2 md:mr-20 md:pr-2">
      <div>
        <FormatCurrency
          currency={transaction.transactionCurrency.symbol}
          decimals={transaction.transactionCurrency.decimals}
          amount={transaction.transactionAmount}
        />

        <ArrowRight size={15} className="inline-block mx-1 -mt-0.5" />

        <FormatCurrency
          currency={transaction.billingCurrency.symbol}
          decimals={transaction.billingCurrency.decimals}
          amount={transaction.billingAmount}
        />

        <TransactionExchangeRateTooltip
          transactionCurrency={transaction.transactionCurrency.symbol}
          billingCurrency={transaction.billingCurrency.symbol}
          exchangeRate={getFormattedExchangeRate()}
        />
      </div>
    </div>
  );
};
