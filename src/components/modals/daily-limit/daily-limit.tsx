import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiV1AccountsOnchainDailyLimit } from "@/client";
import { useUser } from "@/context/UserContext";
import { currencies } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { StandardAlert } from "@/components/ui/standard-alert";
import { DailyLimitView } from "./daily-limit-view";
import { DailyLimitEdit } from "./daily-limit-edit";
import { DailyLimitSuccess } from "./daily-limit-success";

export enum DailyLimitStep {
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

  const currency = useMemo(() => (safeConfig?.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null), [safeConfig]);

  useEffect(() => {
    if (!open) {
      setStep(DailyLimitStep.None);
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

  const handleEditClick = () => {
    setStep(DailyLimitStep.Editing);
  };

  const handleCancel = () => {
    setStep(DailyLimitStep.None);
    setError(null);
  };

  const handleSuccess = () => {
    setStep(DailyLimitStep.Success);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Limits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && <Skeleton className="h-32 w-full" />}

          {error && step === DailyLimitStep.None && (
            <StandardAlert variant="destructive" title="Error" description={error} />
          )}

          {step === DailyLimitStep.Editing && (
            <DailyLimitEdit
              initialLimit={dailyLimit}
              currency={currency}
              onCancel={handleCancel}
              onSuccess={handleSuccess}
            />
          )}

          {step === DailyLimitStep.Success && <DailyLimitSuccess onClose={handleClose} />}

          {step === DailyLimitStep.None && !isLoading && !(error && step === DailyLimitStep.None) && (
            <DailyLimitView
              dailyLimit={dailyLimit}
              allowance={allowance}
              currency={currency}
              onEditClick={handleEditClick}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
