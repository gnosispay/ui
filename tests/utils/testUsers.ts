import type { User, EoaAccount, SafeAccount, KycStatus, Card, BankingDetails } from "../../src/client/types.gen";
import type { SafeConfigMockData } from "./mockSafeConfig";
import type { RewardsMockData } from "./mockRewards";
import type { AccountBalancesMockData } from "./mockAccountBalances";
import type { CardsMockData } from "./mockCards";
import type { DelayRelayMockData } from "./mockDelayRelay";
import type { OrderMockData } from "./mockOrder";
import type { IbansAvailableMockData } from "./mockIbansAvailable";
import type { CardTransactionsMockData } from "./mockCardTransactions";
import { createCard, CardStatus } from "./mockCards";
import { CARD_TRANSACTIONS_SCENARIOS } from "./mockCardTransactions";

export const USER_TEST_PRIVATE_KEY = "21887a39f458c94eee2645f761df490a83f0b7c4d55eae8a670199625e1343e9";
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
  safeAddress: string;
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
}

/**
 * Creates a complete test user with all required data
 */
function createTestUser(config: {
  userId: string;
  signerAddress: string;
  safeAddress: string;
  email: string;
  firstName: string;
  lastName: string;
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
}): TestUser {
  const now = new Date().toISOString();

  const eoaAccount: EoaAccount = {
    id: `eoa-${config.userId}`,
    address: config.signerAddress,
    userId: config.userId,
    createdAt: now,
  };

  const safeAccount: SafeAccount = {
    address: config.safeAddress,
    chainId: "100", // Gnosis chain
    tokenSymbol: "EURe",
    createdAt: now,
  };

  const user: User = {
    id: config.userId,
    email: config.email,
    phone: config.phone || "+1234567890",
    firstName: config.firstName,
    lastName: config.lastName,
    address1: config.address1 || "123 Test Street",
    address2: null,
    city: config.city || "Test City",
    postalCode: "12345",
    state: "Test State",
    country: config.country || "US",
    nationalityCountry: config.country || "US",
    signInWallets: [eoaAccount],
    safeWallets: [safeAccount],
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
