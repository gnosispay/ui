import { Question } from "@phosphor-icons/react/dist/ssr";

interface TransactionExchangeRateTooltip {
  transactionCurrency: string;
  billingCurrency: string;
  exchangeRate: string;
}

export const TransactionExchangeRateTooltip = ({
  transactionCurrency,
  billingCurrency,
  exchangeRate,
}: TransactionExchangeRateTooltip) => (
  <div className="rounded-md pl-0.5 pr-2 text-stone-900 text-sm relative inline-block">
    <div className="relative inline-block group">
      <span className="w-32 text-center absolute bottom-full mb-0 transform right-1/2 -translate-y-1 md:left-1/2 md:-translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 shadow-lg hidden group-hover:block z-50">
        1 {transactionCurrency} = {exchangeRate} {billingCurrency}
      </span>

      <Question className="text-stone-900 inline-block -mt-1 ml-1 w-4 h-4" />
    </div>
  </div>
);
