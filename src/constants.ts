import type { GetApiV1UserTermsResponse } from "./client";

export interface CurrencyInfo {
  tokenSymbol?: string;
  address?: string;
  decimals?: number;
  symbol?: string;
  fiatSymbol?: string;
}

export const currencies: Record<string, CurrencyInfo> = {
  EUR: {
    tokenSymbol: "EURe",
    address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
    decimals: 18,
    symbol: "€",
    fiatSymbol: "EUR",
  },
  GPB: {
    tokenSymbol: "GBPe",
    address: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
    decimals: 18,
    symbol: "£",
    fiatSymbol: "GPB",
  },
  USD: {
    tokenSymbol: "USDCe",
    address: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
    decimals: 6,
    symbol: "$",
    fiatSymbol: "USD",
  },
};

// Helper type to extract the 'type' property from the array element of GetApiV1UserTermsResponse["terms"]
export type UserTermsTypeFromApi = NonNullable<NonNullable<GetApiV1UserTermsResponse["terms"]>[number]["type"]>;

// this is strongly typed to the API response
export const userTermsTitle: Record<UserTermsTypeFromApi, string> = {
  "general-tos": "Gnosis Pay Terms of Service",
  "card-monavate-tos": "Cardholder Terms of Service",
  "cashback-tos": "Cardholder Cashback Terms of Service",
};

export const GNOSIS_PAY_SETTLEMENT_ADDRESS = "0x4822521E6135CD2599199c83Ea35179229A172EE";
