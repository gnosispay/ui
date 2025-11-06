/**
 * Utility functions for working with currency objects in tests
 */

import { currencyData } from "../../src/constants/currencies";

/**
 * Creates a mock currency object in the format expected by transaction mocks
 * The TransactionRow component expects currency.symbol to be the ISO code (fiatSymbol)
 * for use with formatCurrency function
 *
 * This uses the same currency data as src/constants.ts but without the logo imports
 * that cause issues in Playwright tests
 */
export function createMockCurrency(currencyCode: keyof typeof currencyData): {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
} {
  const currency = currencyData[currencyCode];
  if (!currency) {
    throw new Error(`Currency ${currencyCode} not found in currency data`);
  }

  return {
    code: currencyCode,
    name: getCurrencyName(currencyCode),
    symbol: currency.fiatSymbol || "", // Use fiatSymbol as symbol for formatCurrency
    decimals: currency.decimals || 0,
  };
}

/**
 * Get the display name for a currency code
 */
function getCurrencyName(currencyCode: string): string {
  switch (currencyCode) {
    case "EUR":
      return "Euro";
    case "USD":
      return "US Dollar";
    case "GBP":
      return "British Pound";
    default:
      return currencyCode;
  }
}

/**
 * Predefined mock currencies for common use cases
 */
export const mockCurrencies = {
  EUR: createMockCurrency("EUR"),
  USD: createMockCurrency("USD"),
  GBP: createMockCurrency("GBP"),
} as const;
