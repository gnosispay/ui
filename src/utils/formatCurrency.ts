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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyInfo.fiatSymbol }).format(
      valueInUnits,
    );
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `"${currencyInfo.symbol}NaN`;
  }
};
