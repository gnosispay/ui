import { ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";

interface WithdrawBannerProps {
  className?: string;
}

export function WithdrawBanner({ className }: WithdrawBannerProps) {
  return (
    <Link
      to="/withdraw"
      data-testid="withdraw-banner"
      className={cn(
        "group block w-full rounded-lg bg-brand/15 mb-6",
        "cursor-pointer transition-colors hover:bg-brand/25",
        className
      )}
    >
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <div
          className="shrink-0 flex items-center justify-center size-12 sm:size-14 rounded-full bg-brand"
          aria-hidden
        >
          <ArrowUpRight size={28} className="text-button-black" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">Withdraw your funds</h3>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-snug">
            Transfer your balance to an external wallet
          </p>
        </div>

        <ChevronRight
          size={24}
          className="shrink-0 text-foreground hidden sm:block group-hover:translate-x-0.5 transition-transform"
          aria-hidden
        />
      </div>
    </Link>
  );
}
