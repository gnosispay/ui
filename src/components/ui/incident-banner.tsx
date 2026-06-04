import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import { GNOSIS_PAY_STATUS_URL } from "@/constants";

interface IncidentBannerProps {
  className?: string;
}

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

export function IncidentBanner({ className }: IncidentBannerProps) {

  return (
    <div
      data-testid="incident-notice-banner"
      className={cn(
        "block w-full rounded-lg bg-destructive/15 mb-6",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div
            className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-destructive"
            aria-hidden
          >
            <AlertTriangle size={28} className="text-destructive-foreground" />
          </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-foreground text-base sm:text-lg leading-tight">
          Normal operations have been suspended in response to a security incident. The issue has now been contained and we will be resuming operations over the coming days. User funds are not at risk.<br /><br />
          In the meantime:<br />
          - do not send funds to your Card account<br />
          - do not use IBAN<br />
            </h2>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
            <MoreInformationLink
              testId="incident-notice-more-info"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
