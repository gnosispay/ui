import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import type { CurrencyInfo } from "@/constants";

interface DailyLimitViewProps {
  dailyLimit: number | null;
  allowance: number | null;
  currency: CurrencyInfo | null;
  onEditClick: () => void;
}

export const DailyLimitView: React.FC<DailyLimitViewProps> = ({ dailyLimit, allowance, currency, onEditClick }) => {
  const formattedDailyLimit = useMemo(() => {
    return dailyLimit !== null && currency ? formatDisplayAmount(dailyLimit, currency) : null;
  }, [dailyLimit, currency]);

  const formattedAllowance = useMemo(() => {
    return allowance !== null && currency ? formatDisplayAmount(allowance, currency) : null;
  }, [allowance, currency]);

  const progressPercentage = useMemo(() => {
    if (dailyLimit === null || allowance === null || dailyLimit === 0) return 0;
    return Math.max(0, Math.min(100, (allowance / dailyLimit) * 100));
  }, [allowance, dailyLimit]);

  if (dailyLimit === null) {
    return (
      <div className="text-center py-4">
        <div className="text-muted-foreground">No daily limit set</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily limit */}
      <div className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Daily limit</div>
          <div className="text-2xl font-semibold text-foreground">{formattedDailyLimit || "—"}</div>
        </div>

        {allowance !== null && dailyLimit !== null && (
          <div className="space-y-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-end">
              <span className="text-sm text-muted-foreground">{formattedAllowance} remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* Change daily limit button */}
      <Button className="w-full bg-brand hover:bg-brand/90 text-button-black font-medium" onClick={onEditClick}>
        Change daily limit
      </Button>
      <div className="text-center text-sm">
        <a
          href="https://help.gnosispay.com/hc/en-us/articles/39533569163284-Understanding-Your-Card-s-Fees-and-Limits"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          See all fees & limits
        </a>
      </div>
    </div>
  );
};
