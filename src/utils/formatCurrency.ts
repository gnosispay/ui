import type { CurrencyInfo } from "@/constants";

export const formatCurrency = (
  value: string | undefined,
  currencyInfo: CurrencyInfo | undefined,
): string | undefined => {
  if (!value || !currencyInfo || !currencyInfo.decimals) {
    return undefined;
  }

  try {
    const bigIntValue = BigInt(value);
    const valueInUnits = Number(bigIntValue) / 10 ** currencyInfo.decimals;
    return formatDisplayAmount(valueInUnits, currencyInfo);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `"${currencyInfo.symbol}NaN`;
  }
};

export const formatDisplayAmount = (value: number, currencyInfo: CurrencyInfo) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyInfo.fiatSymbol,
  }).format(value);
};
