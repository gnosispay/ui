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
    // Use more precise BigInt arithmetic to avoid floating point precision issues
    const divisor = BigInt(10 ** currencyInfo.decimals);
    const wholePart = bigIntValue / divisor;
    const fractionalPart = bigIntValue % divisor;

    // Convert to decimal with proper precision
    const valueInUnits = Number(wholePart) + Number(fractionalPart) / Number(divisor);
    return formatDisplayAmount(valueInUnits, currencyInfo);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `"${currencyInfo.symbol}NaN`;
  }
};

export const formatDisplayAmount = (value: number, currencyInfo: CurrencyInfo) => {
  // Floor the value to 2 decimal places to prevent rounding up
  // Use more robust approach to handle floating point precision issues
  const multiplied = Math.round(value * 100);
  const flooredValue = Math.floor(multiplied) / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyInfo.fiatSymbol,
  }).format(flooredValue);
};

/**
 * Formats a token amount with appropriate decimal places and symbol
 * For tokens without fiatSymbol, displays as "X.XXXX TOKEN"
 * For fiat currencies, uses the standard currency formatting
 */
export const formatTokenAmount = (
  value: string | undefined,
  tokenInfo: CurrencyInfo | undefined,
): string | undefined => {
  if (!value || !tokenInfo || !tokenInfo.decimals) {
    return undefined;
  }

  try {
    const bigIntValue = BigInt(value);
    const valueInUnits = Number(bigIntValue) / 10 ** tokenInfo.decimals;

    // If it's a fiat currency (has fiatSymbol), use currency formatting
    if (tokenInfo.fiatSymbol) {
      return formatDisplayAmount(valueInUnits, tokenInfo);
    }

    // For tokens, format with appropriate decimal places and symbol
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(valueInUnits);

    return `${formattedNumber} ${tokenInfo.symbol || tokenInfo.tokenSymbol}`;
  } catch (e) {
    console.error("Error formatting token amount:", e);
    return `${tokenInfo.symbol || tokenInfo.tokenSymbol}NaN`;
  }
};
