const PARTNER_BANNER_STORAGE_KEY = "gp-ui.partner-banner-dismissed.v2";
const LEGACY_SAFE_RECOVERY_BANNER_STORAGE_KEY = "gp-ui.legacy-safe-recovery-banner-dismissed.v1";
const INCIDENT_BANNER_STORAGE_KEY = "gp-ui.incident-banner-dismissed.v1";

export interface BannerDismissalData {
  nextShowTimestamp: number;
  count: number;
}

export type BannerType = "partner" | "legacy-safe-recovery" | "incident";

function getBannerStorageKey(bannerType: BannerType): string {
  switch (bannerType) {
    case "legacy-safe-recovery":
      return LEGACY_SAFE_RECOVERY_BANNER_STORAGE_KEY;
    case "incident":
      return INCIDENT_BANNER_STORAGE_KEY;
    default:
      return PARTNER_BANNER_STORAGE_KEY;
  }
}

// Utility functions for exponential backoff
const INITIAL_DELAY_DAYS = 14;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calculateNextShowTimestamp(dismissalCount: number): number {
  // Exponential backoff: 14 days, 28 days, 56 days, 112 days, etc.
  const delayDays = INITIAL_DELAY_DAYS * 2 ** (dismissalCount - 1);
  return Date.now() + delayDays * MS_PER_DAY;
}

export function shouldShowBanner(dismissalData: BannerDismissalData | null): boolean {
  if (!dismissalData) {
    return true; // Never dismissed before
  }

  return Date.now() >= dismissalData.nextShowTimestamp;
}

export function getBannerDismissalData(bannerType: BannerType = "partner"): BannerDismissalData | null {
  try {
    const storageKey = getBannerStorageKey(bannerType);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    // Handle legacy format (just "true") - only for partner banner
    if (stored === "true" && bannerType === "partner") {
      return null; // Treat as never dismissed to show banner again
    }

    return JSON.parse(stored) as BannerDismissalData;
  } catch {
    return null;
  }
}

export function setBannerDismissalData(data: BannerDismissalData, bannerType: BannerType = "partner"): void {
  const storageKey = getBannerStorageKey(bannerType);
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function createDismissalData(currentData: BannerDismissalData | null): BannerDismissalData {
  const newCount = currentData ? currentData.count + 1 : 1;
  return {
    nextShowTimestamp: calculateNextShowTimestamp(newCount),
    count: newCount,
  };
}
