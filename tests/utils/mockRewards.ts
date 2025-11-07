import type { Page } from "@playwright/test";
import type { GetApiV1RewardsResponses } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

/**
 * Rewards data structure - derived from API types
 */
export type RewardsData = GetApiV1RewardsResponses[200];

/**
 * Configuration for mocking Rewards responses
 */
export interface RewardsMockData extends RewardsData {}

/**
 * Sets up a mock for the `/api/v1/rewards` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the rewards endpoint and returns
 * the specified rewards data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose rewards to mock
 * @param rewardsOverrides - Optional overrides for the rewards data
 *
 * @example
 * ```typescript
 * import { mockRewards } from "./utils/mockRewards";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("rewards display", async ({ page }) => {
 *   // Set up the rewards mock with default values
 *   await mockRewards(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockRewards(page, TEST_USER_APPROVED, {
 *     isOg: true,
 *     gnoBalance: 50.0,
 *     cashbackRate: 4.0
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockRewards({
  page,
  testUser,
  rewardsOverrides,
}: {
  page: Page;
  testUser: TestUser;
  rewardsOverrides?: RewardsMockData;
}): Promise<void> {
  await page.route("**/api/v1/rewards", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default rewards data based on test user
        const defaultRewards: RewardsData = {
          isOg: false,
          gnoBalance: 10.0,
          cashbackRate: 2.0,
        };

        // Apply any overrides
        const finalRewards: RewardsData = {
          ...defaultRewards,
          ...testUser.rewards,
          ...rewardsOverrides,
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalRewards),
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
 * Predefined rewards scenarios for common test cases
 */
export const REWARDS_SCENARIOS = {
  /** New user with no GNO balance */
  NEW_USER: {
    isOg: false,
    gnoBalance: 0.0,
    cashbackRate: 0.0,
  },

  /** Regular user with small GNO balance */
  SMALL_BALANCE: {
    isOg: false,
    gnoBalance: 2.5,
    cashbackRate: 1.0,
  },

  /** Regular user with medium GNO balance */
  MEDIUM_BALANCE: {
    isOg: false,
    gnoBalance: 10.0,
    cashbackRate: 2.0,
  },

  /** Regular user with large GNO balance */
  LARGE_BALANCE: {
    isOg: false,
    gnoBalance: 50.0,
    cashbackRate: 4.0,
  },

  /** OG NFT holder with no GNO balance */
  OG_NO_BALANCE: {
    isOg: true,
    gnoBalance: 0.0,
    cashbackRate: 0.0, // Base rate, +1% for OG
  },

  /** OG NFT holder with small GNO balance */
  OG_SMALL_BALANCE: {
    isOg: true,
    gnoBalance: 2.5,
    cashbackRate: 1.0, // Base rate, +1% for OG = 2% total
  },

  /** OG NFT holder with medium GNO balance */
  OG_MEDIUM_BALANCE: {
    isOg: true,
    gnoBalance: 10.0,
    cashbackRate: 2.0, // Base rate, +1% for OG = 3% total
  },

  /** OG NFT holder with large GNO balance */
  OG_LARGE_BALANCE: {
    isOg: true,
    gnoBalance: 50.0,
    cashbackRate: 4.0, // Base rate, +1% for OG = 5% total
  },

  /** Maximum rewards scenario */
  MAX_REWARDS: {
    isOg: true,
    gnoBalance: 100.0,
    cashbackRate: 4.0, // Max base rate, +1% for OG = 5% total
  },

  /** Edge case: OG with exactly threshold amounts */
  OG_THRESHOLD_10: {
    isOg: true,
    gnoBalance: 10.0,
    cashbackRate: 2.0,
  },

  /** Edge case: OG with exactly threshold amounts */
  OG_THRESHOLD_25: {
    isOg: true,
    gnoBalance: 25.0,
    cashbackRate: 3.0,
  },

  /** Edge case: OG with exactly threshold amounts */
  OG_THRESHOLD_50: {
    isOg: true,
    gnoBalance: 50.0,
    cashbackRate: 4.0,
  },

  /** Fractional GNO balance */
  FRACTIONAL_BALANCE: {
    isOg: false,
    gnoBalance: 7.25,
    cashbackRate: 1.5,
  },

  /** Very small GNO balance */
  TINY_BALANCE: {
    isOg: false,
    gnoBalance: 0.1,
    cashbackRate: 0.1,
  },
} as const;

/**
 * Helper function to calculate total cashback rate including OG bonus
 */
export function calculateTotalCashbackRate(rewards: RewardsData): number {
  return rewards.cashbackRate + (rewards.isOg ? 1.0 : 0.0);
}
