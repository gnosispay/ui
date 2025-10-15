import type { GetApiV1UserTermsResponse } from "./client";
import eurLogo from "./assets/tokens/eure.png";
import gbpLogo from "./assets/tokens/gbpe.png";
import usdcLogo from "./assets/tokens/usdce.png";
import gnoLogo from "./assets/tokens/gno.svg";
import xdaiLogo from "./assets/tokens/xdai.svg";
import wethLogo from "./assets/tokens/weth.svg";

export interface CurrencyInfo {
  tokenSymbol?: string;
  address?: string;
  decimals?: number;
  symbol?: string;
  fiatSymbol?: string;
  logo?: string;
}

export type TokenInfo = Omit<CurrencyInfo, "fiatSymbol">;

export const REWARD_ADDRESS = "0xCdF50be9061086e2eCfE6e4a1BF9164d43568EEC";

export const currencies: Record<string, CurrencyInfo> = {
  EUR: {
    tokenSymbol: "EURe",
    address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
    decimals: 18,
    symbol: "€",
    fiatSymbol: "EUR",
    logo: eurLogo,
  },
  GBP: {
    tokenSymbol: "GBPe",
    address: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
    decimals: 18,
    symbol: "£",
    fiatSymbol: "GBP",
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

export const supportedTokens: Record<string, TokenInfo> = {
  GNO: {
    tokenSymbol: "GNO",
    address: "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
    decimals: 18,
    symbol: "GNO",
    logo: gnoLogo,
  },
  XDAI: {
    tokenSymbol: "XDAI",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    symbol: "XDAI",
    logo: xdaiLogo,
  },
  WETH: {
    tokenSymbol: "WETH",
    address: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
    decimals: 18,
    symbol: "WETH",
    logo: wethLogo,
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
export const userTerms: Record<UserTermsTypeFromApi, { title: string; version: string; url: string }> = {
  "general-tos": {
    title: "Gnosis Pay Terms of Service",
    version: "TOS_GENERAL_VERSION_1",
    url: "https://help.gnosispay.com/hc/en-us/articles/39723036951444-Gnosis-Pay-WebApp-Terms-of-Service",
  },
  "card-monavate-tos": {
    title: "Cardholder Terms of Service",
    version: "TOS_CARD_VERSION_1",
    url: "https://help.gnosispay.com/hc/en-us/articles/39726634253076-Monavate-Cardholder-Terms-EEA",
  },
  "cashback-tos": {
    title: "Cardholder Cashback Terms of Service",
    version: "TOS_CASHBACK_2024-08-01",
    url: "https://forum.gnosis.io/t/gip-110-should-the-gnosis-dao-create-and-fund-a-gnosis-pay-rewards-program-with-10k-gno/8837",
  },
  "privacy-policy": {
    title: "Gnosis Pay Privacy and Cookies Policy",
    version: "PRIVACY_POLICY_VERSION_1",
    url: "https://help.gnosispay.com/hc/en-us/articles/39723694982548-Gnosis-Pay-Privacy-and-Cookies-Policy",
  },
};

export const TROUBLE_LOGGING_IN_URL =
  "https://help.gnosispay.com/hc/en-us/articles/41558567635988-The-Gnosis-Pay-Web-App";

export const LEGAL_LINK = "https://help.gnosispay.com/hc/en-us/categories/41384871493524-Legal-Terms-and-Policies";

export const GNOSIS_PAY_SETTLEMENT_ADDRESS = "0x4822521E6135CD2599199c83Ea35179229A172EE";

export const MAX_DAILY_LIMIT = 8000;

export const COUPON_CODES = "GPUI100";

export const ZENDESK_USER_ID_FIELD_ID = "40875525876372";
export const ZENDESK_PARTNER_TAG_VALUE = "GnosisPay v2app";

export const HELP_CENTER_URL = "https://help.gnosispay.com/";

// Monerium Integration Constants
export const MONERIUM_CONSTANTS = {
  CLIENT_CREDENTIALS_AUTHORIZATION: "684d9d2a-a8ff-11f0-b103-f632d5f3d7c9",
  AUTHORIZATION_CODE_FLOW: "684c1884-a8ff-11f0-b103-f632d5f3d7c9",
  API_BASE_URL: "https://api.monerium.app",
  REDIRECT_URI: "http://localhost:5173",
} as const;

export const PARTNER_ID = "cmfo3b7c806fj8bbnp3zad7rb";
