import { ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";

interface WithdrawBannerProps {
  className?: string;
}

export function WithdrawBanner({ className }: WithdrawBannerProps) {
  return (
    <div
      data-testid="withdraw-banner"
      className={cn(
        "block w-full rounded-lg bg-destructive/15 mb-6",
        "transition-colors hover:bg-destructive/25",
        className
      )}
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <Link
          to="/withdraw"
          className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-destructive"
          aria-label="Go to withdraw"
        >
          <ArrowUpRight size={28} className="text-destructive-foreground" aria-hidden />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to="/withdraw"
            data-testid="withdraw-banner-link"
            className="group flex items-start justify-between gap-4"
          >
            <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">
              A bug has been discovered, we are working on a fix. In the mean time you can withdraw your funds here
            </h3>
            <ChevronRight
              size={24}
              className="shrink-0 text-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </Link>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
            <a
              href="https://x.com/gnosispay"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="withdraw-banner-more-info"
              className="text-destructive underline hover:text-destructive/80"
            >
              More information
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
