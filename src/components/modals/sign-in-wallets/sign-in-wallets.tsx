import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type EoaAccount, getApiV1EoaAccounts } from "@/client";
import { StandardAlert } from "@/components/ui/standard-alert";
import { SignInWalletsView } from "./sign-in-wallets-view";
import { SignInWalletsEdit } from "./sign-in-wallets-edit";
import { SignInWalletsSuccessAddition } from "./sign-in-wallets-success-addition";
import { SignInWalletsDeleteConfirmation } from "./sign-in-wallets-delete-confirmation";
import { SignInWalletsSuccessDeletion } from "./sign-in-wallets-success-deletion";

export enum SignInWalletsStep {
  None = "none",
  Editing = "editing",
  SuccessAddition = "successAddition",
  DeleteConfirmation = "deleteConfirmation",
  SuccessDeletion = "successDeletion",
}

interface SignInWalletsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInWalletsModal = ({ open, onOpenChange }: SignInWalletsModalProps) => {
  const [eoaAccounts, setEoaAccounts] = useState<EoaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<SignInWalletsStep>(SignInWalletsStep.None);
  const [selectedAccountForDeletion, setSelectedAccountForDeletion] = useState<EoaAccount | null>(null);

  const fetchEoaAccounts = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getApiV1EoaAccounts()
      .then((response) => {
        if (response.data?.data?.eoaAccounts) {
          setEoaAccounts(response.data.data.eoaAccounts);
        } else {
          setEoaAccounts([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch EOA accounts:", error);
        setError("Failed to load sign-in wallets");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(SignInWalletsStep.None);
      setError(null);
      setSelectedAccountForDeletion(null);
      return;
    }

    fetchEoaAccounts();
  }, [open, fetchEoaAccounts]);

  const handleEditClick = useCallback(() => {
    setStep(SignInWalletsStep.Editing);
  }, []);

  const handleDeleteClick = useCallback((account: EoaAccount) => {
    setSelectedAccountForDeletion(account);
    setStep(SignInWalletsStep.DeleteConfirmation);
  }, []);

  const handleBack = useCallback(() => {
    setStep(SignInWalletsStep.None);
    setError(null);
    setSelectedAccountForDeletion(null);
  }, []);

  const handleCancel = useCallback(() => {
    setStep(SignInWalletsStep.None);
    setError(null);
    setSelectedAccountForDeletion(null);
  }, []);

  const handleSuccessAddition = useCallback(() => {
    setStep(SignInWalletsStep.SuccessAddition);
    fetchEoaAccounts();
  }, [fetchEoaAccounts]);

  const handleSuccessDeletion = useCallback(() => {
    setStep(SignInWalletsStep.SuccessDeletion);
    setSelectedAccountForDeletion(null);
    fetchEoaAccounts();
  }, [fetchEoaAccounts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sign-in wallets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && step === SignInWalletsStep.None && (
            <StandardAlert
              title="Failed to load sign-in wallets"
              description="Please try again later"
              variant="destructive"
            />
          )}

          {step === SignInWalletsStep.Editing && (
            <SignInWalletsEdit onCancel={handleCancel} onSuccess={handleSuccessAddition} />
          )}

          {step === SignInWalletsStep.SuccessAddition && <SignInWalletsSuccessAddition onBack={handleBack} />}

          {step === SignInWalletsStep.DeleteConfirmation && selectedAccountForDeletion && (
            <SignInWalletsDeleteConfirmation
              account={selectedAccountForDeletion}
              onCancel={handleCancel}
              onSuccess={handleSuccessDeletion}
            />
          )}

          {step === SignInWalletsStep.SuccessDeletion && <SignInWalletsSuccessDeletion onBack={handleBack} />}

          {step === SignInWalletsStep.None && (
            <SignInWalletsView
              eoaAccounts={eoaAccounts}
              isLoading={isLoading}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
