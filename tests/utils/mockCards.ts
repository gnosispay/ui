import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";

/**
 * Card status codes from payment processor
 */
export enum CardStatus {
  /** Card is active and can be used */
  ACTIVE = 1000,
  /** Transaction requires issuer approval */
  REFER_TO_ISSUER = 1001,
  /** Card should be captured/retained */
  CAPTURE = 1004,
  /** All transactions are declined */
  DECLINED = 1005,
  /** Card PIN is blocked due to incorrect attempts */
  PIN_BLOCKED = 1006,
  /** All transactions are declined (alternative code) */
  DECLINED_ALT = 1007,
  /** Transaction requires ID verification */
  HONOUR_WITH_ID = 1008,
  /** Card is voided/cancelled */
  VOID = 1009,
  /** Card is reported as lost */
  LOST = 1041,
  /** Card is reported as stolen */
  STOLEN = 1043,
  /** Card has expired */
  EXPIRED = 1054,
  /** Card has expired (alternative code) */
  EXPIRED_ALT = 1154,
  /** Card has restrictions applied */
  RESTRICTED = 1062,
  /** Card is voided/cancelled (alternative code) */
  VOID_ALT = 1199,
}

export type CardStatusCode = CardStatus;

/**
 * Card data structure matching the API response
 */
export interface CardData {
  /** Unique card identifier */
  id: string;
  /** Card token for secure operations */
  cardToken: string;
  /** Last four digits of the card number */
  lastFourDigits: string;
  /** When the card was activated (null if not activated) */
  activatedAt: string | null;
  /** Whether this is a virtual card */
  virtual: boolean;
  /** Card status code from payment processor */
  statusCode: CardStatusCode;
  /** Human-readable card status name */
  statusName: string;
}

/**
 * Configuration for mocking Cards responses
 */
export interface CardsMockData extends Array<CardData> {}

/**
 * Card status data structure matching the API response for individual card status
 */
export interface CardStatusData {
  /** When the card was activated */
  activatedAt?: string;
  /** Card status code from payment processor */
  statusCode: number;
  /** Whether the card is frozen */
  isFrozen: boolean;
  /** Whether the card is reported as stolen */
  isStolen: boolean;
  /** Whether the card is reported as lost */
  isLost: boolean;
  /** Whether the card is blocked */
  isBlocked: boolean;
  /** Whether the card is voided */
  isVoid: boolean;
}

/**
 * Sets up mocks for both `/api/v1/cards` and `/api/v1/cards/{cardId}/status` endpoints in Playwright tests.
 *
 * This function intercepts GET requests to both the cards list endpoint and individual card status endpoints,
 * returning the specified cards data and automatically deriving status information.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose cards to mock
 * @param cardsOverrides - Optional overrides for the cards data
 * @param cardStatusOverrides - Optional overrides for specific card status data
 *
 * @example
 * ```typescript
 * import { mockCards } from "./utils/mockCards";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("cards display", async ({ page }) => {
 *   // Set up the cards mock with default values (includes card status)
 *   await mockCards(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockCards(page, TEST_USER_APPROVED, [
 *     {
 *       id: "card-123",
 *       cardToken: "token-456",
 *       lastFourDigits: "1234",
 *       activatedAt: new Date().toISOString(),
 *       virtual: false,
 *       statusCode: CardStatus.ACTIVE,
 *       statusName: "Active"
 *     }
 *   ], {
 *     "card-123": {
 *       statusCode: CardStatus.ACTIVE,
 *       isFrozen: true, // Override to make this card frozen
 *       isStolen: false,
 *       isLost: false,
 *       isBlocked: false,
 *       isVoid: false
 *     }
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockCards({
  page,
  testUser,
  cardsOverrides,
  cardStatusOverrides,
}: {
  page: Page;
  testUser: TestUser;
  cardsOverrides?: CardsMockData;
  cardStatusOverrides?: Record<string, CardStatusData>;
}): Promise<void> {
  await page.route("**/api/v1/cards", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default cards based on test user
        const defaultCards: CardsMockData = [];

        // Apply any overrides
        const finalCards: CardsMockData = cardsOverrides || testUser.cards || defaultCards;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalCards),
        });
      } catch {
        // Return error response for invalid requests
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Also set up the card status endpoint
  await page.route("**/api/v1/cards/*/status", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Extract card ID from URL
        const url = request.url();
        const cardIdMatch = url.match(/\/api\/v1\/cards\/([^/]+)\/status/);
        const cardId = cardIdMatch?.[1];

        if (!cardId) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ error: "Card not found" }),
          });
          return;
        }

        // Find the card in the test user's cards or overrides
        const finalCards: CardsMockData = cardsOverrides || testUser.cards || [];
        const userCard = finalCards.find((card) => card.id === cardId);

        if (!userCard && !cardStatusOverrides?.[cardId]) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ error: "Card not found" }),
          });
          return;
        }

        // Create default card status based on the card data
        const defaultStatus: CardStatusData = userCard
          ? createCardStatusFromCard(userCard)
          : {
              statusCode: CardStatus.ACTIVE,
              isFrozen: false,
              isStolen: false,
              isLost: false,
              isBlocked: false,
              isVoid: false,
              activatedAt: new Date().toISOString(),
            };

        // Apply any overrides for this specific card
        const finalStatus: CardStatusData = {
          ...defaultStatus,
          ...cardStatusOverrides?.[cardId],
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalStatus),
        });
      } catch {
        // Return error response for invalid requests
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      }
    } else {
      await route.continue();
    }
  });
}

/**
 * Card status code to name mapping
 */
export const CARD_STATUS_NAMES: Record<CardStatusCode, string> = {
  [CardStatus.ACTIVE]: "Active",
  [CardStatus.REFER_TO_ISSUER]: "Refer to Issuer",
  [CardStatus.CAPTURE]: "Capture",
  [CardStatus.DECLINED]: "Declined",
  [CardStatus.PIN_BLOCKED]: "Pin Blocked",
  [CardStatus.DECLINED_ALT]: "Declined",
  [CardStatus.HONOUR_WITH_ID]: "Honour with ID",
  [CardStatus.VOID]: "Void",
  [CardStatus.LOST]: "Lost",
  [CardStatus.STOLEN]: "Stolen",
  [CardStatus.EXPIRED]: "Expired",
  [CardStatus.EXPIRED_ALT]: "Expired",
  [CardStatus.RESTRICTED]: "Restricted",
  [CardStatus.VOID_ALT]: "Void",
};

/**
 * Helper function to create card status data from a card
 */
export function createCardStatusFromCard(card: CardData): CardStatusData {
  // Determine boolean flags based on status code
  const isStolen = card.statusCode === CardStatus.STOLEN;
  const isLost = card.statusCode === CardStatus.LOST;
  const isVoid = card.statusCode === CardStatus.VOID || card.statusCode === CardStatus.VOID_ALT;
  const isBlocked =
    card.statusCode === CardStatus.PIN_BLOCKED ||
    card.statusCode === CardStatus.DECLINED ||
    card.statusCode === CardStatus.DECLINED_ALT ||
    card.statusCode === CardStatus.RESTRICTED;
  const isFrozen = false; // Frozen is a separate action, not determined by status code

  return {
    activatedAt: card.activatedAt || undefined,
    statusCode: card.statusCode,
    isFrozen,
    isStolen,
    isLost,
    isBlocked,
    isVoid,
  };
}

/**
 * Helper function to create a card with consistent data
 */
export function createCard(config: {
  id: string;
  cardToken: string;
  lastFourDigits: string;
  virtual: boolean;
  statusCode?: CardStatusCode;
  activatedAt?: string | null;
}): CardData {
  const statusCode = config.statusCode || CardStatus.ACTIVE;
  const activatedAt = config.activatedAt !== undefined ? config.activatedAt : new Date().toISOString();

  return {
    id: config.id,
    cardToken: config.cardToken,
    lastFourDigits: config.lastFourDigits,
    activatedAt,
    virtual: config.virtual,
    statusCode,
    statusName: CARD_STATUS_NAMES[statusCode],
  };
}

/**
 * Predefined card scenarios for common test cases
 */
export const CARD_SCENARIOS = {
  /** No cards */
  EMPTY: [],

  /** Single active virtual card */
  SINGLE_VIRTUAL: [
    createCard({
      id: "card-virtual-1",
      cardToken: "token-virtual-1",
      lastFourDigits: "1234",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
  ],

  /** Single active physical card */
  SINGLE_PHYSICAL: [
    createCard({
      id: "card-physical-1",
      cardToken: "token-physical-1",
      lastFourDigits: "5678",
      virtual: false,
      statusCode: CardStatus.ACTIVE,
    }),
  ],

  /** Multiple active cards (virtual + physical) */
  MULTIPLE_ACTIVE: [
    createCard({
      id: "card-virtual-1",
      cardToken: "token-virtual-1",
      lastFourDigits: "1234",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-physical-1",
      cardToken: "token-physical-1",
      lastFourDigits: "5678",
      virtual: false,
      statusCode: CardStatus.ACTIVE,
    }),
  ],

  /** Card with issues (blocked) */
  BLOCKED_CARD: [
    createCard({
      id: "card-blocked-1",
      cardToken: "token-blocked-1",
      lastFourDigits: "9999",
      virtual: false,
      statusCode: CardStatus.PIN_BLOCKED,
    }),
  ],

  /** Expired card */
  EXPIRED_CARD: [
    createCard({
      id: "card-expired-1",
      cardToken: "token-expired-1",
      lastFourDigits: "0000",
      virtual: false,
      statusCode: CardStatus.EXPIRED,
    }),
  ],

  /** Lost card */
  LOST_CARD: [
    createCard({
      id: "card-lost-1",
      cardToken: "token-lost-1",
      lastFourDigits: "1111",
      virtual: false,
      statusCode: CardStatus.LOST,
    }),
  ],

  /** Voided card */
  VOIDED_CARD: [
    createCard({
      id: "card-voided-1",
      cardToken: "token-voided-1",
      lastFourDigits: "2222",
      virtual: true,
      statusCode: CardStatus.VOID,
    }),
  ],

  /** Mixed status cards */
  MIXED_STATUS: [
    createCard({
      id: "card-active-1",
      cardToken: "token-active-1",
      lastFourDigits: "1111",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-blocked-1",
      cardToken: "token-blocked-1",
      lastFourDigits: "2222",
      virtual: false,
      statusCode: CardStatus.PIN_BLOCKED,
    }),
    createCard({
      id: "card-expired-1",
      cardToken: "token-expired-1",
      lastFourDigits: "3333",
      virtual: false,
      statusCode: CardStatus.EXPIRED,
    }),
  ],

  /** Maximum cards (5 active cards) */
  MAX_CARDS: [
    createCard({
      id: "card-1",
      cardToken: "token-1",
      lastFourDigits: "1111",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-2",
      cardToken: "token-2",
      lastFourDigits: "2222",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-3",
      cardToken: "token-3",
      lastFourDigits: "3333",
      virtual: false,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-4",
      cardToken: "token-4",
      lastFourDigits: "4444",
      virtual: false,
      statusCode: CardStatus.ACTIVE,
    }),
    createCard({
      id: "card-5",
      cardToken: "token-5",
      lastFourDigits: "5555",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
    }),
  ],

  /** Cards with different activation states */
  MIXED_ACTIVATION: [
    createCard({
      id: "card-activated-1",
      cardToken: "token-activated-1",
      lastFourDigits: "1111",
      virtual: true,
      statusCode: CardStatus.ACTIVE,
      activatedAt: new Date().toISOString(),
    }),
    createCard({
      id: "card-not-activated-1",
      cardToken: "token-not-activated-1",
      lastFourDigits: "2222",
      virtual: false,
      statusCode: CardStatus.ACTIVE,
      activatedAt: null,
    }),
  ],

  /** Restricted card */
  RESTRICTED_CARD: [
    createCard({
      id: "card-restricted-1",
      cardToken: "token-restricted-1",
      lastFourDigits: "7777",
      virtual: false,
      statusCode: CardStatus.RESTRICTED,
    }),
  ],

  /** Stolen card */
  STOLEN_CARD: [
    createCard({
      id: "card-stolen-1",
      cardToken: "token-stolen-1",
      lastFourDigits: "8888",
      virtual: false,
      statusCode: CardStatus.STOLEN,
    }),
  ],

  /** Cards requiring issuer approval */
  REFER_TO_ISSUER: [
    createCard({
      id: "card-refer-1",
      cardToken: "token-refer-1",
      lastFourDigits: "9999",
      virtual: true,
      statusCode: CardStatus.REFER_TO_ISSUER,
    }),
  ],
};

/**
 * Helper function to mock cards with a predefined scenario
 */
export async function mockCardsScenario(
  page: Page,
  testUser: TestUser,
  scenario: keyof typeof CARD_SCENARIOS,
): Promise<void> {
  await mockCards({ page, testUser, cardsOverrides: CARD_SCENARIOS[scenario] });
}

/**
 * Helper function to filter active cards (excludes voided, lost, stolen)
 */
export function getActiveCards(cards: CardsMockData): CardsMockData {
  return cards.filter(
    (card) => ![CardStatus.VOID, CardStatus.VOID_ALT, CardStatus.LOST, CardStatus.STOLEN].includes(card.statusCode),
  );
}

/**
 * Helper function to filter cards by type
 */
export function filterCardsByType(cards: CardsMockData, virtual: boolean): CardsMockData {
  return cards.filter((card) => card.virtual === virtual);
}

/**
 * Helper function to filter cards by status
 */
export function filterCardsByStatus(cards: CardsMockData, statusCode: CardStatusCode): CardsMockData {
  return cards.filter((card) => card.statusCode === statusCode);
}

/**
 * Helper function to generate random last four digits
 */
export function generateLastFourDigits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Helper function to generate a card ID
 */
export function generateCardId(prefix: string = "card"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to generate a card token
 */
export function generateCardToken(prefix: string = "token"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 12)}`;
}

/**
 * Helper function to create card status data
 */
export function createCardStatus(config: {
  statusCode?: CardStatus;
  isFrozen?: boolean;
  isStolen?: boolean;
  isLost?: boolean;
  isBlocked?: boolean;
  isVoid?: boolean;
  activatedAt?: string;
}): CardStatusData {
  const statusCode = config.statusCode || CardStatus.ACTIVE;

  return {
    statusCode,
    isFrozen: config.isFrozen || false,
    isStolen: config.isStolen || statusCode === CardStatus.STOLEN,
    isLost: config.isLost || statusCode === CardStatus.LOST,
    isBlocked:
      config.isBlocked ||
      [CardStatus.PIN_BLOCKED, CardStatus.DECLINED, CardStatus.DECLINED_ALT, CardStatus.RESTRICTED].includes(
        statusCode,
      ),
    isVoid: config.isVoid || statusCode === CardStatus.VOID || statusCode === CardStatus.VOID_ALT,
    activatedAt: config.activatedAt || (statusCode === CardStatus.ACTIVE ? new Date().toISOString() : undefined),
  };
}

/**
 * Predefined card status scenarios for common test cases
 */
export const CARD_STATUS_SCENARIOS = {
  /** Active card */
  ACTIVE: createCardStatus({
    statusCode: CardStatus.ACTIVE,
    activatedAt: new Date().toISOString(),
  }),

  /** Frozen card */
  FROZEN: createCardStatus({
    statusCode: CardStatus.ACTIVE,
    isFrozen: true,
    activatedAt: new Date().toISOString(),
  }),

  /** Stolen card */
  STOLEN: createCardStatus({
    statusCode: CardStatus.STOLEN,
    isStolen: true,
  }),

  /** Lost card */
  LOST: createCardStatus({
    statusCode: CardStatus.LOST,
    isLost: true,
  }),

  /** Blocked card (PIN blocked) */
  BLOCKED: createCardStatus({
    statusCode: CardStatus.PIN_BLOCKED,
    isBlocked: true,
  }),

  /** Voided card */
  VOIDED: createCardStatus({
    statusCode: CardStatus.VOID,
    isVoid: true,
  }),

  /** Expired card */
  EXPIRED: createCardStatus({
    statusCode: CardStatus.EXPIRED,
    activatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Activated 1 year ago
  }),

  /** Restricted card */
  RESTRICTED: createCardStatus({
    statusCode: CardStatus.RESTRICTED,
    isBlocked: true,
    activatedAt: new Date().toISOString(),
  }),

  /** Card requiring issuer approval */
  REFER_TO_ISSUER: createCardStatus({
    statusCode: CardStatus.REFER_TO_ISSUER,
    activatedAt: new Date().toISOString(),
  }),

  /** Not activated card */
  NOT_ACTIVATED: createCardStatus({
    statusCode: CardStatus.ACTIVE,
    activatedAt: undefined,
  }),
} as const;
