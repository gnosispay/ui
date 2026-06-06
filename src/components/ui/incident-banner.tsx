import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { isAddress, type Address } from "viem";
import { useSafeMigration } from "@/hooks/useSafeMigration";
import { useSafeRecoveryData } from "@/hooks/useSafeRecoveryData";
import { useZendesk } from "react-use-zendesk";
import { useCallback } from "react";

interface IncidentBannerProps {
  className?: string;
  showDisruption?: boolean;
}

export function IncidentBanner({ className, showDisruption = false }: IncidentBannerProps) {
  const { open, show } = useZendesk();
  const handleSupportClick = useCallback(() => { open(); show(); }, [open, show]);
  const { hasOldSafe, oldSafe, isLoading: isMigrationLoading } = useSafeMigration();
  const oldSafeAddress = oldSafe?.address && isAddress(oldSafe.address) ? (oldSafe.address as Address) : undefined;
  const { affected, hasPreHackBalance, isLoading: isDataLoading } = useSafeRecoveryData(oldSafeAddress);

  if (showDisruption) {
    return (
      <div className={cn("block w-full rounded-lg mb-6 bg-warning/15", className)} role="alert">
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <div className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-warning" aria-hidden>
            <AlertTriangle size={28} className="text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-base sm:text-lg leading-tight">Service disruption</p>
            <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
              Normal card operations will resume within the next 12-24 hours. We're very sorry for the disruption.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasOldSafe || isMigrationLoading || isDataLoading || affected === undefined || hasPreHackBalance === undefined) {
    return null;
  }

  return (
    <div
      data-testid="incident-notice-banner"
      className={cn(
        "block w-full rounded-lg mb-6",
        affected ? "bg-destructive/15" : "bg-warning/15",
        className
      )}
      role="alert"
    >
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
                Balances have also been restored for over 95% of cases and we are working through final edge cases now. If you have any doubts please{" "}
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
