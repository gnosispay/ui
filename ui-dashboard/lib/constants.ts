import type { Address } from "viem";

export const GNO_TOKEN_ADDRESS = "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb";

// Gnosis Pay Account setup
export const DELAY_COOLDOWN = 3 * 60;
export const DELAY_EXPIRATION = 30 * 60;
export const DEFAULT_ALLOWANCE_PERIOD = 60 * 60 * 24;
export const GNOSIS_CHAIN_ID = 100;

// Gnosis policies
export const GNOSIS_PAY_TOS_URL =
  "https://legal.gnosispay.com/en/articles/8911632-gnosis-pay-terms-of-service";
export const GNOSIS_PAY_PRIVACY_POLICY_URL =
  "https://legal.gnosispay.com/en/articles/8646483-gnosis-pay-privacy-and-cookies-policy";
export const GNOSIS_CASHBACK_TOS_URL =
  "https://forum.gnosis.io/t/gip-110-should-the-gnosis-dao-create-and-fund-a-gnosis-pay-rewards-program-with-10k-gno/8837";
export const GNOSIS_CASHBACK_FAQ_URL =
  "https://help.gnosispay.com/en/collections/10334867-rewards";
export const GNOSIS_REFERRAL_FAQ_URL =
  "https://help.gnosispay.com/en/articles/11002477-understanding-gnosis-pay-referral-program";

// Gnosis Scan
export const GNOSIS_SCAN_URL = "https://gnosisscan.io";
export const GNOSIS_ADDRESS_URL = `${GNOSIS_SCAN_URL}/address`;

export const getGnosisAddressUrl = (address: string) =>
  `${GNOSIS_ADDRESS_URL}/${address}`;

export const SENTINEL_ADDRESS =
  "0x0000000000000000000000000000000000000001" as Address;

// Monavate
export const MONAVATE_PRIVACY_POLICY_URL =
  "https://monavate.com/privacy-policy";
export const MONAVATE_TOS_URL =
  "/activation/legal-links/monavate-cardholder-terms";

// Faucet link
export const GNOSIS_FAUCET_URL = "https://faucet.gnosischain.com/";

// Partner configuration
export enum Partner {
  PICNIC = "picnic",
  ZEAL = "zeal",
  METRI = "metri",
  GREENHOOD = "greenhood",
}

export enum PartnerStatus {
  ACTIVE = "active",
  COMING_SOON = "coming-soon",
}

interface PartnerConfig {
  name: string;
  activationUrl: string;
  external: boolean;
  status: PartnerStatus;
}

export const PARTNER_CONFIG: Record<Partner, PartnerConfig> = {
  [Partner.PICNIC]: {
    name: "Picnic",
    activationUrl: "https://usepicnic.com/activate-card",
    external: true,
    status: PartnerStatus.ACTIVE,
  },
  [Partner.ZEAL]: {
    name: "Zeal",
    activationUrl: "https://link.zeal.app/physical-card-activation",
    external: true,
    status: PartnerStatus.ACTIVE,
  },
  [Partner.GREENHOOD]: {
    name: "Greenhood",
    activationUrl: "https://www.greenhoodwallet.com/activate-gnosis-pay",
    external: true,
    status: PartnerStatus.ACTIVE,
  },
  [Partner.METRI]: {
    name: "Metri",
    activationUrl: "https://app.metri.xyz/card",
    external: true,
    status: PartnerStatus.ACTIVE,
  },
};

// Dates
export const DATE_FORMAT = "MMM dd, yyyy";

export const SENDGRID_WAITLIST_CONTACT_LIST_ID =
  "774babdf-bfb5-4780-a3a0-0adcc35eb0c9";

export const SENDGRID_ATTEMPTED_SIGNUP_CONTACT_LIST_ID =
  "37d700be-5593-4c81-a505-f506b1db8ce7";

export const HOMEPAGE_URL = "https://gnosispay.com/";

export const EXTERNAL_SIGNUP_URL = "https://app.gnosispay.com/signup";

export const CARD_PRICE_EURE = 30.23; // TODO: Should be deprecated from the frontend, we are now using the backend value, but leaving this for migration period
export const CARD_GAS_FEE_XDAI = 0.01;

export enum PERSONALIZATION_OPTIONS {
  ENS = "ENS",
  KYC = "KYC",
}

export const SIGN_MESSAGE_LIB_ADDRESS =
  "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2";

export const MAX_SIGNIN_ATTEMPTS = 3;

// When a new version comes out, add it at the END. Do NOT remove existing versions.
export const CASHBACK_TOS_SLUG = "cashback-tos";
export const CASHBACK_TOS_VERSIONS = ["TOS_CASHBACK_2024-08-01"];

// Social media
export const TWITTER_LINK = "https://twitter.com/gnosispay";
export const DISCORD_LINK = "https://discord.gg/gnosispay";

export const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
export const LOOPS_UPDATE_CONTACT_API_ENDPOINT =
  "https://app.loops.so/api/v1/contacts/update";

export const LOOPS_WAITLIST_MAILING_LIST_ID = "clzgqugif00se0mmkh9nu4eha";

export enum ZENDESK_TICKET_TYPES {
  DISPUTE_TRANSACTION = "DISPUTE_TRANSACTION",
  STOLEN_CARD = "STOLEN_CARD",
  LOST_CARD = "LOST_CARD",
  FRAUDULENT_TRANSACTION = "FRAUDULENT_TRANSACTION",
}

// This is a zendesk custom field for CR classification
export const CR_CLASSIFICATION_ID = "31875545573908";
export const ZENDESK_USER_ID_FIELD_ID = "40875525876372";
export const ZENDESK_PARTNER_TAG_VALUE = "GnosisPay v1app";
