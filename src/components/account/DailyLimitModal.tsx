import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getApiV1AccountsOnchainDailyLimit,
  getApiV1AccountsOnchainDailyLimitTransactionData,
  putApiV1AccountsOnchainDailyLimit,
} from "@/client";
import { useUser } from "@/context/UserContext";
import { currencies, MAX_DAILY_LIMIT } from "@/constants";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { populateExecuteEnqueue } from "@gnosispay/account-kit";
import { gnosis } from "viem/chains";
import { useSignTypedData } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

enum DailyLimitStep {
  None = "none",
  Editing = "editing",
  Success = "success",
}

interface DailyLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({ open, onOpenChange }) => {
  const { safeConfig } = useUser();
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<DailyLimitStep>(DailyLimitStep.None);
  const [newLimit, setNewLimit] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  const currency = safeConfig?.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null;

  useEffect(() => {
    if (!open) {
      setStep(DailyLimitStep.None);
      setNewLimit("");
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getApiV1AccountsOnchainDailyLimit()
      .then((response) => {
        if (response.error) {
          setError("Failed to fetch daily limit");
          return;
        }

        setDailyLimit(response.data?.data?.onchainDailyLimit ?? null);
        setAllowance(response.data?.data?.onchainDailyRemaining ?? null);
      })
      .catch((err) => {
        setError("Failed to fetch daily limit");
        console.error("Error fetching daily limit:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open]);

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

  const handleEditClick = () => {
    setNewLimit(dailyLimit?.toString() || "");
    setStep(DailyLimitStep.Editing);
  };

  const handleCancel = () => {
    setStep(DailyLimitStep.None);
    setNewLimit("");
    setError(null);
  };

  const handleSave = useCallback(async () => {
    if (!safeConfig?.address || !currency) {
      return;
    }

    const limitNumber = Math.round(Number(newLimit));

    if (Number.isNaN(limitNumber) || limitNumber < 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (limitNumber > MAX_DAILY_LIMIT) {
      setError(`Daily limit cannot exceed ${formatDisplayAmount(MAX_DAILY_LIMIT, currency)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error, data } = await getApiV1AccountsOnchainDailyLimitTransactionData({
        query: {
          onchainDailyLimit: limitNumber.toString(),
        },
      });

      if (error) {
        setError("Failed to create transaction");
        return;
      }

      const { data: signature } = await populateExecuteEnqueue(
        { account: safeConfig.address, chainId: gnosis.id },
        data?.data?.transaction,
        signTypedDataAsync,
      );

      if (!signature) {
        setError("Failed to sign transaction");
        return;
      }

      const { error: putError, data: putData } = await putApiV1AccountsOnchainDailyLimit({
        body: {
          onchainDailyLimit: limitNumber,
          signature,
        },
      });

      if (putError) {
        setError("Failed to update daily limit");
        return;
      }

      console.log("putData", putData);
      setStep(DailyLimitStep.Success);
    } catch (err) {
      setError("Failed to create transaction");
      console.error("Error creating transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [newLimit, currency, safeConfig?.address, signTypedDataAsync]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const value = Math.round(Number(e.target.value));

    if (value === 0) {
      setNewLimit("");
    } else {
      setNewLimit(value.toString());
    }
  }, []);

  const onSetMax = useCallback(() => {
    onChange({ target: { value: MAX_DAILY_LIMIT.toString() } } as React.ChangeEvent<HTMLInputElement>);
  }, [onChange]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-32 w-full" />;
    }

    if (error && step === DailyLimitStep.None) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    switch (step) {
      case DailyLimitStep.Editing:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="daily-limit" className="text-sm text-muted-foreground">
                Daily limit
              </label>
              <div className="relative">
                <Input
                  id="daily-limit"
                  type="number"
                  value={newLimit}
                  onChange={onChange}
                  placeholder="350"
                  className="text-2xl font-semibold h-16 pr-16"
                  min="0"
                  max={MAX_DAILY_LIMIT}
                />
                <Button
                  variant="ghost"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium"
                  onClick={onSetMax}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Max limit: {currency?.symbol}
              {MAX_DAILY_LIMIT.toLocaleString()}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
                onClick={handleSave}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        );

      case DailyLimitStep.Success:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-success" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Success</h3>
              <p className="text-sm text-muted-foreground">
                Your transaction is queued and will be executed in 3 minutes.
              </p>
            </div>

            <Button
              className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        );

      default: // DailyLimitStep.None
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
            <Button
              className="w-full bg-brand hover:bg-brand/90 text-button-black font-medium"
              onClick={handleEditClick}
            >
              Change daily limit
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Limits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};
