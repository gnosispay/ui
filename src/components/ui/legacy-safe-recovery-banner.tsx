import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { isAddress, type Address } from "viem";
import { useSafeMigration } from "@/hooks/useSafeMigration";
import { useOldSafeBalances } from "@/hooks/useOldSafeBalances";
import {
  createDismissalData,
  getBannerDismissalData,
  setBannerDismissalData,
  shouldShowBanner,
} from "@/utils/bannerUtils";

interface LegacySafeRecoveryBannerProps {
  className?: string;
}

const HEADLINE = "You may be able to recover funds from a previous Safe account." as const;

export function LegacySafeRecoveryBanner({ className }: LegacySafeRecoveryBannerProps) {
  const { hasOldSafe, oldSafe } = useSafeMigration();
  const oldSafeAddress = oldSafe?.address && isAddress(oldSafe.address) ? (oldSafe.address as Address) : undefined;
  const { hasBalance } = useOldSafeBalances(oldSafeAddress);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissalData = getBannerDismissalData("legacy-safe-recovery");
    setIsDismissed(!shouldShowBanner(dismissalData));
  }, []);

  const handleDismiss = useCallback(() => {
    const currentData = getBannerDismissalData("legacy-safe-recovery");
    const newData = createDismissalData(currentData);

    setBannerDismissalData(newData, "legacy-safe-recovery");
    setIsDismissed(true);
  }, []);

  if (isDismissed || !hasOldSafe || !oldSafeAddress || !hasBalance) {
    return null;
  }

  return (
    <div
      data-testid="legacy-safe-recovery-banner"
      className={cn(
        "relative block w-full rounded-lg bg-warning/15 mb-6 transition-colors hover:bg-warning/25",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
        aria-label="Dismiss banner"
        data-testid="legacy-safe-recovery-banner-dismiss"
      >
        <X size={14} className="text-foreground" />
      </button>

      <div className="flex items-start gap-4 p-5 sm:p-6">
        <Link
          to="/withdraw-legacy"
          className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-warning"
          aria-label="Go to legacy withdraw"
        >
          <ArrowUpRight size={28} className="text-background" aria-hidden />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to="/withdraw-legacy"
            data-testid="legacy-safe-recovery-banner-link"
            className="group flex items-start justify-between gap-4 pr-6"
          >
            <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">{HEADLINE}</h3>
            <ChevronRight
              size={24}
              className="shrink-0 text-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </Link>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
            Withdraw any remaining balance from your previous Safe.
          </p>
        </div>
      </div>
    </div>
  );
}
