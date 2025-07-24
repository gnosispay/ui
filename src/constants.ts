import type { GetApiV1UserTermsResponse } from "./client";
import eurLogo from "./assets/eure.png";
import gbpLogo from "./assets/gbpe.png";
import usdcLogo from "./assets/usdce.png";

export interface CurrencyInfo {
  tokenSymbol?: string;
  address?: string;
  decimals?: number;
  symbol?: string;
  fiatSymbol?: string;
  logo?: string;
}

export const currencies: Record<string, CurrencyInfo> = {
  EUR: {
    tokenSymbol: "EURe",
    address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
    decimals: 18,
    symbol: "€",
    fiatSymbol: "EUR",
    logo: eurLogo,
  },
  GPB: {
    tokenSymbol: "GBPe",
    address: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
    decimals: 18,
    symbol: "£",
    fiatSymbol: "GPB",
    logo: gbpLogo,
  },
  USD: {
    tokenSymbol: "USDCe",
    address: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
    decimals: 6,
    symbol: "$",
    fiatSymbol: "USD",
    logo: usdcLogo,
  },
};

export const ADD_FUNDS_CONSTANTS = {
  GNOSIS_PAY_HELP_URL: "https://help.gnosispay.com/en/articles/8896057-how-to-get-eure-or-gbpe-on-gnosis-chain",
  DEBRIDGE_LICENSE_URL: "https://docs.debridge.finance/legal/sdk-and-api-license-agreement",
  MONERIUM_AUTHORISED_URL: "https://cb.is/financial-supervision/regulated-activities/supervised-entities/",
} as const;

// Helper type to extract the 'type' property from the array element of GetApiV1UserTermsResponse["terms"]
export type UserTermsTypeFromApi = NonNullable<NonNullable<GetApiV1UserTermsResponse["terms"]>[number]["type"]>;

// this is strongly typed to the API response
export const userTermsTitle: Record<UserTermsTypeFromApi, string> = {
  "general-tos": "Gnosis Pay Terms of Service",
  "card-monavate-tos": "Cardholder Terms of Service",
  "cashback-tos": "Cardholder Cashback Terms of Service",
};

export const GNOSIS_PAY_SETTLEMENT_ADDRESS = "0x4822521E6135CD2599199c83Ea35179229A172EE";
