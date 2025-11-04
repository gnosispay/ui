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
 * Default test user - fully approved and set up
 */
export const TEST_USER_APPROVED = createTestUser({
  userId: "test-user-approved",
  signerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  safeAddress: "0x1234567890123456789012345678901234567890",
  email: "approved@test.com",
  firstName: "John",
  lastName: "Approved",
  kycStatus: "approved",
  isPhoneValidated: true,
  isSourceOfFundsAnswered: true,
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
 * User who hasn't started KYC yet
 */
export const TEST_USER_NOT_STARTED = createTestUser({
  userId: "test-user-not-started",
  signerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  safeAddress: "0x2345678901234567890123456789012345678901",
  email: "notstarted@test.com",
  firstName: "Jane",
  lastName: "NotStarted",
  kycStatus: "notStarted",
  isPhoneValidated: false,
  isSourceOfFundsAnswered: false,
  safeConfig: {
    hasNoApprovals: true,
    isDeployed: false,
    address: null,
    accountStatus: 1, // SafeNotDeployed
    accountAllowance: undefined,
  },
  rewards: {
    isOg: false,
    gnoBalance: 0.0,
    cashbackRate: 0.0,
  },
  accountBalances: {
    total: "0",
    spendable: "0",
    pending: "0",
  },
  cardsMock: [], // No cards for user who hasn't started KYC
  delayRelay: [], // Empty for now
  orders: [], // Empty for now
  ibansAvailable: { available: false }, // Not available for user who hasn't started KYC
  cardTransactions: CARD_TRANSACTIONS_SCENARIOS.empty, // Empty transactions
});

/**
 * User with pending KYC
 */
export const TEST_USER_PENDING_KYC = createTestUser({
  userId: "test-user-pending",
  signerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  safeAddress: "0x3456789012345678901234567890123456789012",
  email: "pending@test.com",
  firstName: "Bob",
  lastName: "Pending",
  kycStatus: "pending",
  isPhoneValidated: true,
  isSourceOfFundsAnswered: true,
});

/**
 * User with rejected KYC
 */
export const TEST_USER_REJECTED = createTestUser({
  userId: "test-user-rejected",
  signerAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  safeAddress: "0x4567890123456789012345678901234567890123",
  email: "rejected@test.com",
  firstName: "Alice",
  lastName: "Rejected",
  kycStatus: "rejected",
  isPhoneValidated: true,
  isSourceOfFundsAnswered: true,
});

/**
 * User requiring action on KYC
 */
export const TEST_USER_REQUIRES_ACTION = createTestUser({
  userId: "test-user-action",
  signerAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  safeAddress: "0x5678901234567890123456789012345678901234",
  email: "action@test.com",
  firstName: "Charlie",
  lastName: "RequiresAction",
  kycStatus: "requiresAction",
  isPhoneValidated: true,
  isSourceOfFundsAnswered: true,
  safeConfig: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 7, // DelayQueueNotEmpty
    accountAllowance: {
      balance: "150.00",
      refill: "300.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    },
  },
});

/**
 * Fully set up user with cards and banking
 */
export const TEST_USER_FULLY_SETUP = (() => {
  const baseUser = createTestUser({
    userId: "test-user-full",
    signerAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    safeAddress: "0x6789012345678901234567890123456789012345",
    email: "full@test.com",
    firstName: "David",
    lastName: "FullySetup",
    kycStatus: "approved",
    isPhoneValidated: true,
    isSourceOfFundsAnswered: true,
  });

  // Add card
  const mockCard: Card = {
    id: "card-full-123",
    cardToken: "card-token-full-456",
    lastFourDigits: "5678",
    activatedAt: new Date().toISOString(),
    virtual: false,
  };

  // Add banking details
  const mockBankingDetails: BankingDetails = {
    id: "banking-full-123",
    address: baseUser.safeAddress,
    moneriumIban: "DE89370400440532013000",
    moneriumBic: "COBADEFFXXX",
    moneriumIbanStatus: "ASSIGNED",
    userId: baseUser.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...baseUser,
    user: {
      ...baseUser.user,
      cards: [mockCard],
      bankingDetails: mockBankingDetails,
    },
    rewards: {
      isOg: true,
      gnoBalance: 50.0,
      cashbackRate: 4.0, // Max base rate, +1% for OG = 5% total
    },
    accountBalances: {
      total: "1000000", // €10000.00 in cents
      spendable: "950000", // €9500.00 in cents
      pending: "50000", // €500.00 in cents
    },
    cards: [
      createCard({
        id: "card-full-virtual-1",
        cardToken: "token-full-virtual-1",
        lastFourDigits: "5678",
        virtual: true,
        statusCode: CardStatus.ACTIVE,
      }),
      createCard({
        id: "card-full-physical-1",
        cardToken: "token-full-physical-1",
        lastFourDigits: "9012",
        virtual: false,
        statusCode: CardStatus.ACTIVE,
      }),
    ],
    delayRelay: [], // Empty for now
    orders: [], // Empty for now
    ibansAvailable: { available: true }, // Available for fully setup user
    cardTransactions: CARD_TRANSACTIONS_SCENARIOS.empty, // Start with empty transactions
  };
})();

/**
 * Deactivated user
 */
export const TEST_USER_DEACTIVATED = createTestUser({
  userId: "test-user-deactivated",
  signerAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  safeAddress: "0x7890123456789012345678901234567890123456",
  email: "deactivated@test.com",
  firstName: "Eve",
  lastName: "Deactivated",
  kycStatus: "approved",
  status: "DEACTIVATED",
});

/**
 * User from Germany (different country)
 */
export const TEST_USER_GERMANY = createTestUser({
  userId: "test-user-germany",
  signerAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  safeAddress: "0x8901234567890123456789012345678901234567",
  email: "germany@test.com",
  firstName: "Hans",
  lastName: "Mueller",
  phone: "+49123456789",
  address1: "Musterstraße 123",
  city: "Berlin",
  country: "DE",
  kycStatus: "approved",
});

/**
 * User with multiple cards
 */
export const TEST_USER_MULTIPLE_CARDS = (() => {
  const baseUser = createTestUser({
    userId: "test-user-multi-cards",
    signerAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    safeAddress: "0x9012345678901234567890123456789012345678",
    email: "multicards@test.com",
    firstName: "Sarah",
    lastName: "MultiCards",
    kycStatus: "approved",
  });

  const cards: Card[] = [
    {
      id: "card-multi-1",
      cardToken: "card-token-multi-1",
      lastFourDigits: "1111",
      activatedAt: new Date().toISOString(),
      virtual: true,
    },
    {
      id: "card-multi-2",
      cardToken: "card-token-multi-2",
      lastFourDigits: "2222",
      activatedAt: new Date().toISOString(),
      virtual: false,
    },
  ];

  return {
    ...baseUser,
    user: {
      ...baseUser.user,
      cards,
    },
  };
})();

/**
 * All available test users
 */
export const ALL_TEST_USERS = {
  TEST_USER_APPROVED,
  TEST_USER_NOT_STARTED,
  TEST_USER_PENDING_KYC,
  TEST_USER_REJECTED,
  TEST_USER_REQUIRES_ACTION,
  TEST_USER_FULLY_SETUP,
  TEST_USER_DEACTIVATED,
  TEST_USER_GERMANY,
  TEST_USER_MULTIPLE_CARDS,
} as const;

/**
 * Get a test user by name for easier access
 */
export function getTestUser(name: keyof typeof ALL_TEST_USERS): TestUser {
  return ALL_TEST_USERS[name];
}
