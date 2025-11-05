import type { TestUser } from "./testUsers";

/**
 * Formats an Ethereum address for display by showing the first 4 and last 6 characters
 * with ellipsis in between (e.g., "0xf39F...b92266")
 *
 * @param address - The full Ethereum address
 * @returns The formatted address string
 */
export function formatAddressForDisplay(address: string): string {
  if (!address || address.length < 10) {
    throw new Error("Invalid address format");
  }

  // Remove 0x prefix for processing
  const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

  // Take first 4 and last 6 characters
  const prefix = cleanAddress.slice(0, 4);
  const suffix = cleanAddress.slice(-6);

  return `0x${prefix}...${suffix}`;
}

/**
 * Creates a regex pattern to match the formatted address display for a test user.
 * This is useful for finding UI elements that display shortened wallet addresses.
 *
 * @param testUser - The test user whose address to format
 * @returns A RegExp that matches the formatted address
 *
 * @example
 * ```typescript
 * import { createAddressDisplayRegex } from "./utils/addressUtils";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("wallet address display", async ({ page }) => {
 *   const addressRegex = createAddressDisplayRegex(TEST_USER_APPROVED.signerAddress);
 *
 *   // This will match "0xf39F...b92266" for TEST_USER_APPROVED
 *   await expect(page.getByRole("button", { name: addressRegex })).toBeVisible();
 * });
 * ```
 */
export function createAddressDisplayRegex(signerAddress: string): RegExp {
  const formatted = formatAddressForDisplay(signerAddress);

  // Escape special regex characters and replace ... with \.\.\.
  const escapedPattern = formatted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(escapedPattern);
}

/**
 * Creates a more flexible regex pattern that matches common address display formats.
 * This handles variations in ellipsis representation and case sensitivity.
 *
 * @param testUser - The test user whose address to format
 * @returns A RegExp that matches various formatted address representations
 */
export function createFlexibleAddressRegex(testUser: TestUser): RegExp {
  const address = testUser.signerAddress;
  const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

  // Get prefix and suffix, handling both upper and lower case
  const prefix = cleanAddress.slice(0, 4);
  const suffix = cleanAddress.slice(-6);

  // Create pattern that matches various ellipsis formats and case variations
  const pattern = `0x${prefix}[.\u2026]{2,3}${suffix}`;

  return new RegExp(pattern, "i"); // Case insensitive
}

/**
 * Utility to get the expected address display text for assertions
 *
 * @param testUser - The test user whose address to format
 * @returns The expected display text
 */
export function getExpectedAddressDisplay(testUser: TestUser): string {
  return formatAddressForDisplay(testUser.signerAddress);
}
