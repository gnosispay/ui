// Helper to extract error message from error object
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    if ("error" in error && typeof (error as { error?: unknown }).error === "string") {
      return (error as { error?: string }).error || fallback;
    }
    if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
      return (error as { message?: string }).message || fallback;
    }
    if (
      "error" in error &&
      typeof (error as { error?: unknown }).error === "object" &&
      (error as { error?: unknown }).error !== null
    ) {
      const errObj = (error as { error?: unknown }).error as Record<string, unknown>;
      if ("error" in errObj && typeof errObj.error === "string") return errObj.error;
      if ("message" in errObj && typeof errObj.message === "string") return errObj.message;
    }
  }
  return fallback;
}
