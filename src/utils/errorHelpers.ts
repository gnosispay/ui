// Helper to extract string message from an object
const getStringMessage = (obj: Record<string, unknown>): string | undefined => {
  if (!obj || typeof obj !== "object") return undefined;
  if (typeof obj.error === "string") return obj.error;
  if (typeof obj.message === "string") return obj.message;
  return undefined;
};

// Helper to extract error message from error object
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  // Try to extract from top-level object
  if (typeof error === "object" && error !== null) {
    const topLevelMsg = getStringMessage(error as Record<string, unknown>);
    if (topLevelMsg) return topLevelMsg;

    // Try to extract from nested 'error' object
    if (
      "error" in error &&
      typeof (error as Record<string, unknown>).error === "object" &&
      (error as Record<string, unknown>).error !== null
    ) {
      const nestedMsg = getStringMessage((error as Record<string, unknown>).error as Record<string, unknown>);
      if (nestedMsg) return nestedMsg;
    }
  }

  return fallback;
}
