/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 * @param countryCode - Two-letter country code (e.g., "US", "IT", "FR")
 * @returns Flag emoji string or null if no country code provided
 */
export const getCountryFlag = (countryCode?: string): string | null => {
  if (!countryCode) return null;

  // Convert ISO 3166-1 alpha-2 country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};
