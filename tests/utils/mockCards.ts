import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import type { GetApiV1CardsResponses, GetApiV1CardsByCardIdStatusResponses } from "../../src/client/types.gen";

/**
 * Type alias for the card data from the API
 */
type CardFromApi = GetApiV1CardsResponses[200][number];

/**
 * Type alias for the card status response from the API
 */
type CardStatusFromApi = GetApiV1CardsByCardIdStatusResponses[200];

/**
 * Card status codes from payment processor - derived from API types
 * Using satisfies to ensure compile-time validation against the API's statusCode union
 */
export const CardStatus = {
  /** Card is active and can be used */
  ACTIVE: 1000 as const,
  /** Transaction requires issuer approval */
  REFER_TO_ISSUER: 1001 as const,
  /** Card should be captured/retained */
  CAPTURE: 1004 as const,
  /** All transactions are declined */
  DECLINED: 1005 as const,
  /** Card PIN is blocked due to incorrect attempts */
  PIN_BLOCKED: 1006 as const,
  /** All transactions are declined (alternative code) */
  DECLINED_ALT: 1007 as const,
  /** Transaction requires ID verification */
  HONOUR_WITH_ID: 1008 as const,
  /** Card is voided/cancelled */
  VOID: 1009 as const,
  /** Card is reported as lost */
  LOST: 1041 as const,
  /** Card is reported as stolen */
  STOLEN: 1043 as const,
  /** Card has expired */
  EXPIRED: 1054 as const,
  /** Card has expired (alternative code) */
  EXPIRED_ALT: 1154 as const,
  /** Card has restrictions applied */
  RESTRICTED: 1062 as const,
  /** Card is voided/cancelled (alternative code) */
  VOID_ALT: 1199 as const,
} satisfies Record<string, CardFromApi["statusCode"]>;

/**
 * Type alias for card status code - derived from API type
 */
export type CardStatusCode = CardFromApi["statusCode"];

/**
 * Card data structure - uses API type directly
 * This ensures compile-time validation against API changes
 */
export type CardData = CardFromApi;

/**
 * Configuration for mocking Cards responses
 */
export interface CardsMockData extends Array<CardFromApi> {}

/**
 * Card status data structure - uses API type directly
 * This ensures compile-time validation against API changes
 */
export type CardStatusData = CardStatusFromApi;

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
  const isFrozen = card.statusCode === CardStatus.DECLINED;
  const isStolen = card.statusCode === CardStatus.STOLEN;
  const isLost = card.statusCode === CardStatus.LOST;
  const isVoid = card.statusCode === CardStatus.VOID || card.statusCode === CardStatus.VOID_ALT;
  const isBlocked =
    card.statusCode === CardStatus.PIN_BLOCKED ||
    card.statusCode === CardStatus.DECLINED_ALT ||
    card.statusCode === CardStatus.RESTRICTED;

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
}): CardFromApi {
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
  VIRTUAL: createCard({
    id: "card-virtual-1",
    cardToken: "token-virtual-1",
    lastFourDigits: "1234",
    virtual: true,
    statusCode: CardStatus.ACTIVE,
  }),

  /** Single active physical card */
  PHYSICAL: createCard({
    id: "card-physical-1",
    cardToken: "token-physical-1",
    lastFourDigits: "5678",
    virtual: false,
    statusCode: CardStatus.ACTIVE,
  }),

  /** Frozen card scenario */
  FROZEN: createCard({
    id: "card-frozen",
    cardToken: "token-frozen",
    lastFourDigits: "9999",
    virtual: false,
    statusCode: CardStatus.DECLINED,
  }),

  /** Expired card scenario */
  EXPIRED: createCard({
    id: "card-expired",
    cardToken: "token-expired",
    lastFourDigits: "7777",
    virtual: false,
    statusCode: CardStatus.EXPIRED,
  }),

  /** PIN blocked card scenario */
  PIN_BLOCKED: createCard({
    id: "card-pin-blocked",
    cardToken: "token-pin-blocked",
    lastFourDigits: "8888",
    virtual: false,
    statusCode: CardStatus.PIN_BLOCKED,
  }),

  /** Voided card scenario */
  VOIDED: createCard({
    id: "card-voided",
    cardToken: "token-voided",
    lastFourDigits: "0000",
    virtual: false,
    statusCode: CardStatus.VOID,
  }),

  /** Lost card scenario */
  LOST: createCard({
    id: "card-lost",
    cardToken: "token-lost",
    lastFourDigits: "1111",
    virtual: false,
    statusCode: CardStatus.LOST,
  }),

  /** Stolen card scenario */
  STOLEN: createCard({
    id: "card-stolen",
    cardToken: "token-stolen",
    lastFourDigits: "2222",
    virtual: false,
    statusCode: CardStatus.STOLEN,
  }),

  DEACTIVATED_PHYSICAL_CARD: createCard({
    id: "card-deactivated-physical",
    cardToken: "token-deactivated-physical",
    lastFourDigits: "3333",
    virtual: false,
    statusCode: CardStatus.ACTIVE,
    activatedAt: null, // Not activated yet - needs physical activation
  }),
};
