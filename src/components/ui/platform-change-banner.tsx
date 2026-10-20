import { Info, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCallback, useMemo, useState } from "react";
import { dismissPlatformChangeBanner, isPlatformChangeBannerDismissed } from "@/utils/bannerUtils";
import { HELP_CENTER_URL, REBIND_URL } from "@/constants";

interface PlatformChangeBannerProps {
  className?: string;
}

export function PlatformChangeBanner({ className }: PlatformChangeBannerProps) {
  const [dismissedLocally, setDismissedLocally] = useState(false);

  const isDismissed = useMemo(() => {
    if (dismissedLocally) return true;
    return isPlatformChangeBannerDismissed();
  }, [dismissedLocally]);

  const handleDismiss = useCallback(() => {
    dismissPlatformChangeBanner();
    setDismissedLocally(true);
  }, []);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      data-testid="platform-change-banner"
      className={cn("relative block w-full mb-6 bg-info/15", className)}
      role="status"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
        aria-label="Dismiss banner"
        data-testid="platform-change-banner-dismiss"
      >
        <X size={16} className="text-foreground" />
      </button>

      <div className="flex items-start gap-4 p-5 sm:p-6 pr-12">
        <div
          className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-info"
          aria-hidden
        >
          <Info size={28} className="text-info-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base sm:text-lg leading-tight">Gnosis Pay the Next Era</p>
          <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
            The web app will close down for everything apart from withdrawals from December 20th.
          </p>
          <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
            EUR cardholders can move their existing account to Rebind via their dedicated migration flow:{" "}
            <a
              href={REBIND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:opacity-80 transition-opacity"
            >
              rebind.co/gnosis-pay
            </a>
            .
          </p>
          <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
            Or visit our help centre for more options:{" "}
            <a
              href={HELP_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:opacity-80 transition-opacity"
            >
              help.gnosispay.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
