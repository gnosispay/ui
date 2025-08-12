/**
 * Helper function to get CSS custom property value
 * @param property - The CSS custom property name (e.g., '--color-brand')
 * @returns The computed CSS variable value or empty string if not found/available
 */
export const getCSSVariable = (property: string): string => {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  }
  return "";
};
