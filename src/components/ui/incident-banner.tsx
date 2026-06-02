import { AlertTriangle, ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { GNOSIS_PAY_STATUS_URL } from "@/constants";

interface IncidentBannerProps {
  variant: "withdraw" | "notice";
  className?: string;
}

const INCIDENT_HEADLINE =
  "Normal operations have been suspended in response to a security incident. The issue has now been contained and we will bre resuming normal operations over the coming days. User funds are not at risk." as const;

const WITHDRAW_HEADLINE =
  `${INCIDENT_HEADLINE} In the mean time you can withdraw your funds here` as const;

function MoreInformationLink({ testId }: { testId: string }) {
  return (
    <a
      href={GNOSIS_PAY_STATUS_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      className="text-destructive underline hover:text-destructive/80"
    >
      More information
    </a>
  );
}

export function IncidentBanner({ variant, className }: IncidentBannerProps) {
  const isWithdraw = variant === "withdraw";

  return (
    <div
      data-testid={isWithdraw ? "withdraw-banner" : "incident-notice-banner"}
      className={cn(
        "block w-full rounded-lg bg-destructive/15 mb-6",
        isWithdraw && "transition-colors hover:bg-destructive/25",
        className
      )}
      role={isWithdraw ? undefined : "alert"}
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        {isWithdraw ? (
          <Link
            to="/withdraw"
            className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-destructive"
            aria-label="Go to withdraw"
          >
            <ArrowUpRight size={28} className="text-destructive-foreground" aria-hidden />
          </Link>
        ) : (
          <div
            className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-destructive"
            aria-hidden
          >
            <AlertTriangle size={28} className="text-destructive-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {isWithdraw ? (
            <Link
              to="/withdraw"
              data-testid="withdraw-banner-link"
              className="group flex items-start justify-between gap-4"
            >
              <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">
                {WITHDRAW_HEADLINE}
              </h3>
              <ChevronRight
                size={24}
                className="shrink-0 text-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform"
                aria-hidden
              />
            </Link>
          ) : (
            <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">
              {INCIDENT_HEADLINE}
            </h3>
          )}
          <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
            <MoreInformationLink
              testId={isWithdraw ? "withdraw-banner-more-info" : "incident-notice-more-info"}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
