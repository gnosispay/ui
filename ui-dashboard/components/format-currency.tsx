import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

interface FormatCurrencyProps {
  currency?:
    | "EUR"
    | "USD"
    | "GBP"
    | "JPY"
    | "CNY"
    | "CAD"
    | "AUD"
    | "CHF"
    | string;
  amount: bigint | string | number | undefined;
  decimals: number;
  currencyClassName?: string;
  integerClassName?: string;
  decimalClassName?: string;
  FractionClassName?: string;
}

const FormatCurrency = ({
  currency,
  amount,
  decimals,
  currencyClassName,
  integerClassName,
  decimalClassName,
  FractionClassName,
}: FormatCurrencyProps) => {
  const numberformatter = new Intl.NumberFormat("en-UK", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 2,
    roundingMode: "floor",
    currencyDisplay: "narrowSymbol",
  } as Intl.NumberFormatOptions);
  const number = Number(amount);
  const formattableNumber = Number.isInteger(number)
    ? parseFloat(formatUnits(BigInt(number), decimals))
    : number;
  return (
    <>
      {numberformatter
        .formatToParts(amount ? formattableNumber : 0)
        .map((part, idx) => {
          const isCurrency = part.type === "currency";
          const isInteger = part.type === "integer";
          const isDecimal = part.type === "decimal";
          const isFraction = part.type === "fraction";

          if (isCurrency && !currency) {
            return null;
          }
          return (
            <span
              key={idx}
              className={twMerge(
                isCurrency && currencyClassName,
                isInteger && integerClassName,
                isDecimal && decimalClassName,
                isFraction && "text-xs opacity-60",
                isFraction && FractionClassName,
              )}
            >
              {part.value}
            </span>
          );
        })}
    </>
  );
};

export default FormatCurrency;
