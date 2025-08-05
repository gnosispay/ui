import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiV1AccountsOnchainDailyLimit } from "@/client";
import { useUser } from "@/context/UserContext";
import { currencies } from "@/constants";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { Skeleton } from "../ui/skeleton";

interface DailyLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({ open, onOpenChange }) => {
  const { safeConfig } = useUser();
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = safeConfig?.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null;

  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    setError(null);

    getApiV1AccountsOnchainDailyLimit()
      .then((response) => {
        if (response.error) {
          setError("Failed to fetch daily limit");
          return;
        }

        setDailyLimit(response.data?.data?.onchainDailyLimit ?? null);
      })
      .catch((err) => {
        setError("Failed to fetch daily limit");
        console.error("Error fetching daily limit:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open]);

  const formattedLimit = useMemo(() => {
    return dailyLimit !== null && currency ? formatDisplayAmount(dailyLimit, currency) : null;
  }, [dailyLimit, currency]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Daily Spending Limit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Your current daily spending limit is:</div>

          {isLoading && <Skeleton className="h-10 w-full" />}

          {error && (
            <div className="text-center py-4">
              <div className="text-destructive">{error}</div>
            </div>
          )}

          {!isLoading && !error && formattedLimit && (
            <div className="text-center py-4">
              <div className="text-2xl font-semibold text-foreground">{formattedLimit}</div>
              <div className="text-sm text-muted-foreground mt-1">per day</div>
            </div>
          )}

          {!isLoading && !error && dailyLimit === null && (
            <div className="text-center py-4">
              <div className="text-muted-foreground">No daily limit set</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
