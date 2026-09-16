import { MessageCircleOff, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SUPPORT_EMAIL } from "@/constants";
import { cn } from "@/utils/cn";
import { dismissChatOutageBanner, isChatOutageBannerDismissed } from "@/utils/bannerUtils";

interface ChatOutageBannerProps {
  className?: string;
}

export function ChatOutageBanner({ className }: ChatOutageBannerProps) {
  const [dismissedLocally, setDismissedLocally] = useState(false);

  const isDismissed = useMemo(() => {
    if (dismissedLocally) return true;
    return isChatOutageBannerDismissed();
  }, [dismissedLocally]);

  const handleDismiss = useCallback(() => {
    dismissChatOutageBanner();
    setDismissedLocally(true);
  }, []);

  if (isDismissed) {
    return null;
  }

  return (
    <div className={cn("px-4 pt-4 lg:px-0", className)}>
      <div className="relative block w-full bg-warning/15" data-testid="chat-outage-banner" role="alert">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
          aria-label="Dismiss banner"
          data-testid="chat-outage-banner-dismiss"
        >
          <X size={16} className="text-foreground" />
        </button>

        <div className="flex items-start gap-4 p-5 sm:p-6">
          <div
            className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-warning"
            aria-hidden
          >
            <MessageCircleOff size={28} className="text-background" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <p className="font-bold text-foreground text-base sm:text-lg leading-tight">
              Chat support temporarily unavailable
            </p>

            <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
              Our chat widget is offline while we update our systems. In the meantime, please email us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="underline font-medium hover:opacity-80 transition-opacity"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and our team will pick it up from there.
            </p>

            <p className="mt-2 text-sm sm:text-base text-foreground leading-snug">
              If you have an open conversation from chat, it hasn't been lost. We're contacting everyone affected by
              email over the next few days, using the email address registered to your Gnosis Pay account - so please
              keep an eye on that inbox, including your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
