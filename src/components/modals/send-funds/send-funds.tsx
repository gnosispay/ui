import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useCallback } from "react";
import type { CurrencyInfoWithBalance } from "@/hooks/useTokenBalance";
import { SendFundsForm } from "./send-funds-form";
import { SendFundsConfirm } from "./send-funds-confirm";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidatedFormData {
  toAddress: string;
  selectedToken: CurrencyInfoWithBalance;
  amount: bigint;
}

enum Step {
  Form = "form",
  Confirm = "confirm",
}

export const SendFundsModal = ({ open, onOpenChange }: AddFundsModalProps) => {
  const [step, setStep] = useState<Step>(Step.Form);
  const [formData, setFormData] = useState<ValidatedFormData | null>(null);

  const clearAndClose = useCallback(() => {
    onOpenChange(false);
    setStep(Step.Form);
    setFormData(null);
  }, [onOpenChange]);

  const handleFormNext = useCallback((data: ValidatedFormData) => {
    setFormData(data);
    setStep(Step.Confirm);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogTitle>Send funds</DialogTitle>

        {step === Step.Form && <SendFundsForm onNext={handleFormNext} />}
        {step === Step.Confirm && formData && (
          <SendFundsConfirm
            selectedToken={formData.selectedToken}
            amount={formData.amount}
            toAddress={formData.toAddress}
            onBack={() => setStep(Step.Form)}
            onSuccess={clearAndClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
