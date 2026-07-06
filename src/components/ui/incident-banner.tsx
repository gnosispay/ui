import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { isAddress, type Address } from "viem";
import { useSafeMigration } from "@/hooks/useSafeMigration";
import { useSafeRecoveryData } from "@/hooks/useSafeRecoveryData";
import { useZendesk } from "react-use-zendesk";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dismissIncidentBanner,
  getIncidentBannerVariant,
  isIncidentBannerDismissed,
} from "@/utils/bannerUtils";

interface IncidentBannerProps {
  className?: string;
}

export function IncidentBanner({ className }: IncidentBannerProps) {
  const { open, show } = useZendesk();
  const handleSupportClick = useCallback(() => { open(); show(); }, [open, show]);
  const { hasOldSafe, oldSafe, isLoading: isMigrationLoading } = useSafeMigration();
  const oldSafeAddress = oldSafe?.address && isAddress(oldSafe.address) ? (oldSafe.address as Address) : undefined;
  const { affected, hasPreHackBalance, isLoading: isDataLoading } = useSafeRecoveryData(oldSafeAddress);

  const variant = useMemo(() => {
    if (affected === undefined || hasPreHackBalance === undefined) return null;
    return getIncidentBannerVariant(affected, hasPreHackBalance);
  }, [affected, hasPreHackBalance]);

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!variant) return;
    setIsVisible(!isIncidentBannerDismissed(variant));
  }, [variant]);

  const handleDismiss = useCallback(() => {
    if (!variant) return;
    dismissIncidentBanner(variant);
    setIsVisible(false);
  }, [variant]);

  if (
    !hasOldSafe ||
    isMigrationLoading ||
    isDataLoading ||
    affected === undefined ||
    hasPreHackBalance === undefined ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div
      data-testid="incident-notice-banner"
      className={cn(
        "relative block w-full rounded-lg mb-6",
        affected ? "bg-destructive/15" : "bg-warning/15",
        className
      )}
      role="alert"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
        aria-label="Dismiss banner"
        data-testid="incident-notice-banner-dismiss"
      >
        <X size={16} className="text-foreground" />
      </button>

      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div
          className={cn(
            "shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full",
            affected ? "bg-destructive" : "bg-warning"
          )}
          aria-hidden
        >
          <AlertTriangle size={28} className={affected ? "text-destructive-foreground" : "text-background"} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base sm:text-lg leading-tight">
            Your Gnosis Pay card is back up and running.
          </p>

          {!affected && hasPreHackBalance && (
            <>
              <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
                To keep your account secure, we issued you a new Gnosis Pay Safe. Your funds are safe, but you'll need to move them from your old Safe before you can spend with your card.
              </p>
              <Link
                to="/withdraw-legacy"
                className="mt-3 inline-flex items-center rounded-md bg-warning px-4 py-2 text-sm font-medium text-background hover:bg-warning/90 transition-colors"
              >
                Move my funds
              </Link>
            </>
          )}

          {!affected && !hasPreHackBalance && (
            <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
              To keep your account secure, we issued you a new Gnosis Pay Safe. Please only use the new Safe address going forward.
            </p>
          )}

          {affected && hasPreHackBalance && (
            <>
              <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
                We issued you a new Gnosis Pay Safe. Your previous Safe is no longer secure. Do not use your old Safe address again: anything you send there will be lost.
              </p>
              <p className="mt-1 text-sm sm:text-base text-foreground leading-snug">
                Balances have also been restored for all affected accounts. If you have any doubts please{" "}
                <button
                  onClick={handleSupportClick}
                  className="underline font-medium hover:opacity-80 transition-opacity cursor-pointer"
                >
                  contact support
                </button>
                .
              </p>
            </>
          )}

          {affected && !hasPreHackBalance && (
            <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
              We've issued you a new Gnosis Pay Safe because your previous Safe is no longer secure. Do not use your old Safe address again: anything you send there will be lost.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
