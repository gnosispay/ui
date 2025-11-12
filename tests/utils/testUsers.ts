import type { User, EoaAccount, SafeAccount, KycStatus, Card, BankingDetails } from "../../src/client/types.gen";
import type { SafeConfigMockData } from "./mockSafeConfig";
import type { RewardsMockData } from "./mockRewards";
import type { AccountBalancesMockData } from "./mockAccountBalances";
import type { CardsMockData } from "./mockCards";
import type { DelayRelayMockData } from "./mockDelayRelay";
import type { OrderMockData } from "./mockOrder";
import type { IbansAvailableMockData } from "./mockIbansAvailable";
import type { CardTransactionsMockData } from "./mockCardTransactions";
import type { IbanOrdersMockData } from "./mockIbanOrders";
import { createCard, CardStatus } from "./mockCards";
import { CARD_TRANSACTIONS_SCENARIOS } from "./mockCardTransactions";

export const USER_TEST_PRIVATE_KEY = "0x21887a39f458c94eee2645f761df490a83f0b7c4d55eae8a670199625e1343e9";
export const USER_TEST_SIGNER_ADDRESS = "0x0D04547F7a54710C6E5C1d9f2794DE8423951cD8";
/**
 * Complete test user configuration including all addresses and IDs
 */
export interface TestUser {
  /** User profile data */
  user: User;
  /** Signer address for wallet connections */
  signerAddress: string;
  /** Safe address for the user's Safe wallet */
  safeAddress?: string;
  /** User ID for consistent referencing */
  userId: string;
  /** Whether the user has completed sign up process */
  hasSignedUp: boolean;
  /** Safe configuration mock data */
  safeConfig?: SafeConfigMockData;
  /** Rewards mock data */
  rewards?: RewardsMockData;
  /** Account balances mock data */
  accountBalances?: AccountBalancesMockData;
  /** Cards mock data */
  cards?: CardsMockData;
  /** Delay relay mock data */
  delayRelay?: DelayRelayMockData;
  /** Orders mock data */
  orders?: OrderMockData;
  /** IBAN availability mock data */
  ibansAvailable?: IbansAvailableMockData;
  /** Card transactions mock data */
  cardTransactions?: CardTransactionsMockData;
  /** IBAN orders mock data */
  ibanOrders?: IbanOrdersMockData;
}

/**
 * Creates a complete test user with all required data
 */
function createTestUser(config: {
  userId: string;
  signerAddress: string;
  safeAddress?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address1?: string;
  city?: string;
  country?: string;
  kycStatus?: KycStatus;
  isPhoneValidated?: boolean;
  isSourceOfFundsAnswered?: boolean;
  hasSignedUp?: boolean;
  cards?: Array<Card>;
  bankingDetails?: BankingDetails | null;
  status?: "ACTIVE" | "DEACTIVATED";
  safeConfig?: SafeConfigMockData;
  rewards?: RewardsMockData;
  accountBalances?: AccountBalancesMockData;
  cardsMock?: CardsMockData;
  delayRelay?: DelayRelayMockData;
  orders?: OrderMockData;
  ibansAvailable?: IbansAvailableMockData;
  cardTransactions?: CardTransactionsMockData;
  ibanOrders?: IbanOrdersMockData;
}): TestUser {
  const now = new Date().toISOString();

  const eoaAccount: EoaAccount = {
    id: `eoa-${config.userId}`,
    address: config.signerAddress,
    userId: config.userId,
    createdAt: now,
  };

  // Only create safe account if safeAddress is provided
  const safeWallets: SafeAccount[] = config.safeAddress
    ? [
        {
          address: config.safeAddress,
          chainId: "100", // Gnosis chain
          tokenSymbol: "EURe",
          createdAt: now,
        },
      ]
    : [];

  const user: User = {
    id: config.userId,
    email: config.email || null,
    phone: config.phone || "+1234567890",
    firstName: config.firstName || null,
    lastName: config.lastName || null,
    address1: config.address1 || "123 Test Street",
    address2: null,
    city: config.city || "Test City",
    postalCode: "12345",
    state: "Test State",
    country: config.country || "US",
    nationalityCountry: config.country || "US",
    signInWallets: [eoaAccount],
    safeWallets: safeWallets,
    kycStatus: config.kycStatus || "approved",
    availableFeatures: {
      moneriumIban: true,
    },
    cards: config.cards || [],
    bankingDetails: config.bankingDetails || undefined,
    isSourceOfFundsAnswered: config.isSourceOfFundsAnswered ?? true,
    isPhoneValidated: config.isPhoneValidated ?? true,
    partnerId: null,
    status: config.status || "ACTIVE",
  };

  return {
    user,
    signerAddress: config.signerAddress,
    safeAddress: config.safeAddress,
    userId: config.userId,
    hasSignedUp: config.hasSignedUp ?? true,
    safeConfig: config.safeConfig,
    rewards: config.rewards,
    accountBalances: config.accountBalances,
    cards: config.cardsMock,
    delayRelay: config.delayRelay,
    orders: config.orders,
    ibansAvailable: config.ibansAvailable,
    cardTransactions: config.cardTransactions,
    ibanOrders: config.ibanOrders,
  };
}

// Predefined test users for different scenarios

/**
 * Base test user - fully approved and set up for testing
 */
export const BASE_USER = createTestUser({
  userId: "test-user-approved",
  signerAddress: USER_TEST_SIGNER_ADDRESS,
  safeAddress: "0x1234567890123456789012345678901234567890",
  email: "approved@test.com",
  firstName: "John",
  lastName: "Approved",
  kycStatus: "approved",
  isPhoneValidated: true,
  isSourceOfFundsAnswered: true,
  hasSignedUp: true,
  bankingDetails: {
    moneriumIban: "DE89370400440532013000",
  },
  safeConfig: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 0, // Ok
    accountAllowance: {
      balance: "1000.00",
      refill: "500.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  rewards: {
    isOg: false,
    gnoBalance: 10.0,
    cashbackRate: 2.0,
  },
  accountBalances: {
    total: "250000", // €2500.00 in cents
    spendable: "250000",
    pending: "0",
  },
  cardsMock: [
    createCard({
      id: "card-approved-1",
      cardToken: "token-approved-1",
      lastFourDigits: "1234",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
  ],
  delayRelay: [], // Empty for now
  orders: [], // Empty for now
  ibansAvailable: { available: true }, // Available for approved user
  cardTransactions: CARD_TRANSACTIONS_SCENARIOS.empty, // Start with empty transactions
});

/**
 * Helper function to create a test user without IBAN
 * Useful for testing scenarios where user is eligible but hasn't created IBAN yet
 */
export const createUserWithoutIban = (baseUser: TestUser = BASE_USER): TestUser => {
  return {
    ...baseUser,
    user: {
      ...baseUser.user,
      bankingDetails: {
        ...baseUser.user.bankingDetails,
        moneriumIban: undefined,
      },
    },
  };
};

/**
 * Helper function to create a test user with IBAN
 * Useful for testing scenarios where user has already created an IBAN
 */
export const createUserWithIban = (
  baseUser: TestUser = BASE_USER,
  iban: string = "DE89370400440532013000",
  bic: string = "COBADEFFXXX",
  status: string = "ASSIGNED",
): TestUser => {
  return {
    ...baseUser,
    user: {
      ...baseUser.user,
      bankingDetails: {
        moneriumIban: iban,
        moneriumBic: bic,
        moneriumIbanStatus: status,
      },
    },
  };
};

// ============================================================================
// Onboarding Test Users
// ============================================================================

/**
 * Test user who has not signed up yet
 * Useful for testing the initial signup flow
 */
export const USER_NOT_SIGNED_UP = createTestUser({
  userId: "test-user-not-signed-up",
  signerAddress: USER_TEST_SIGNER_ADDRESS,
  safeAddress: undefined,
  email: undefined,
  firstName: undefined,
  lastName: undefined,
  kycStatus: "notStarted",
  isPhoneValidated: false,
  isSourceOfFundsAnswered: false,
  hasSignedUp: false,
  cards: [],
  bankingDetails: null,
  status: "ACTIVE",
});

/**
 * Test user who has signed up but not started KYC
 * Useful for testing the KYC initiation flow
 */
export const USER_SIGNED_UP_NO_KYC = createTestUser({
  ...USER_NOT_SIGNED_UP,
  kycStatus: "notStarted",
  email: "test@test.com",
  isSourceOfFundsAnswered: false,
  isPhoneValidated: false,
  hasSignedUp: true,
});

/**
 * Test user with KYC pending (documents submitted)
 * Useful for testing the KYC waiting state
 */
export const USER_KYC_PENDING = createTestUser({
  ...USER_SIGNED_UP_NO_KYC,
  kycStatus: "pending",
  isSourceOfFundsAnswered: false,
  isPhoneValidated: false,
});

/**
 * Test user with KYC processing
 * Useful for testing the KYC processing state
 */
export const USER_KYC_PROCESSING = createTestUser({
  ...USER_KYC_PENDING,
  kycStatus: "processing",
  isSourceOfFundsAnswered: false,
  isPhoneValidated: false,
});

/**
 * Test user with KYC approved but no source of funds answered
 * Useful for testing the source of funds flow
 */
export const USER_KYC_APPROVED_NO_SOF = createTestUser({
  ...USER_KYC_PROCESSING,
  kycStatus: "approved",
  isSourceOfFundsAnswered: false,
  isPhoneValidated: false,
});

/**
 * Test user with source of funds answered but phone not validated
 * Useful for testing the phone verification flow
 */
export const USER_SOF_ANSWERED_NO_PHONE = createTestUser({
  userId: USER_KYC_APPROVED_NO_SOF.userId,
  signerAddress: USER_KYC_APPROVED_NO_SOF.signerAddress,
  safeAddress: USER_KYC_APPROVED_NO_SOF.safeAddress,
  email: USER_KYC_APPROVED_NO_SOF.user.email,
  firstName: USER_KYC_APPROVED_NO_SOF.user.firstName,
  lastName: USER_KYC_APPROVED_NO_SOF.user.lastName,
  kycStatus: "approved",
  isSourceOfFundsAnswered: true,
  isPhoneValidated: false,
  hasSignedUp: true,
});

/**
 * Test user ready for safe deployment
 * Useful for testing the safe deployment flow
 */
export const USER_READY_FOR_SAFE_DEPLOYMENT = createTestUser({
  userId: USER_SOF_ANSWERED_NO_PHONE.userId,
  signerAddress: USER_SOF_ANSWERED_NO_PHONE.signerAddress,
  safeAddress: USER_SOF_ANSWERED_NO_PHONE.safeAddress,
  email: USER_SOF_ANSWERED_NO_PHONE.user.email,
  firstName: USER_SOF_ANSWERED_NO_PHONE.user.firstName,
  lastName: USER_SOF_ANSWERED_NO_PHONE.user.lastName,
  kycStatus: "approved",
  isSourceOfFundsAnswered: true,
  isPhoneValidated: true,
  hasSignedUp: true,
});
