import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StandardAlert } from "@/components/ui/standard-alert";
import { SafeOwnersView } from "./safe-owners-view";
import { SafeOwnersEdit } from "./safe-owners-edit";
import { SafeOwnersSuccessAddition } from "./safe-owners-success-addition";
import { SafeOwnersDeleteConfirmation } from "./safe-owners-delete-confirmation";
import { SafeOwnersSuccessDeletion } from "./safe-owners-success-deletion";
import { getApiV1Owners } from "@/client";

export enum SafeOwnersStep {
  None = "none",
  Editing = "editing",
  SuccessAddition = "successAddition",
  DeleteConfirmation = "deleteConfirmation",
  SuccessDeletion = "successDeletion",
}

interface SafeOwnersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SafeOwnersModal = ({ open, onOpenChange }: SafeOwnersModalProps) => {
  const [owners, setOwners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<SafeOwnersStep>(SafeOwnersStep.None);
  const [selectedOwnerForDeletion, setSelectedOwnerForDeletion] = useState<string | null>(null);

  const fetchOwners = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getApiV1Owners()
      .then((response) => {
        if (response.data?.data?.owners) {
          setOwners(response.data.data.owners);
        } else {
          setOwners([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch Safe owners:", error);
        setError("Failed to load Safe owners");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(SafeOwnersStep.None);
      setError(null);
      setSelectedOwnerForDeletion(null);
      return;
    }

    fetchOwners();
  }, [open, fetchOwners]);

  const handleEditClick = useCallback(() => {
    setStep(SafeOwnersStep.Editing);
  }, []);

  const handleDeleteClick = useCallback((ownerAddress: string) => {
    setSelectedOwnerForDeletion(ownerAddress);
    setStep(SafeOwnersStep.DeleteConfirmation);
  }, []);

  const handleBack = useCallback(() => {
    setStep(SafeOwnersStep.None);
    setError(null);
    setSelectedOwnerForDeletion(null);
  }, []);

  const handleCancel = useCallback(() => {
    setStep(SafeOwnersStep.None);
    setError(null);
    setSelectedOwnerForDeletion(null);
  }, []);

  const handleSuccessAddition = useCallback(() => {
    setStep(SafeOwnersStep.SuccessAddition);
    fetchOwners();
  }, [fetchOwners]);

  const handleSuccessDeletion = useCallback(() => {
    setStep(SafeOwnersStep.SuccessDeletion);
    setSelectedOwnerForDeletion(null);
    fetchOwners();
  }, [fetchOwners]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Safe owners</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && step === SafeOwnersStep.None && (
            <StandardAlert
              title="Failed to load Safe owners"
              description="Please try again later"
              variant="destructive"
            />
          )}

          {step === SafeOwnersStep.Editing && (
            <SafeOwnersEdit onCancel={handleCancel} onSuccess={handleSuccessAddition} />
          )}

          {step === SafeOwnersStep.SuccessAddition && <SafeOwnersSuccessAddition onBack={handleBack} />}

          {step === SafeOwnersStep.DeleteConfirmation && selectedOwnerForDeletion && (
            <SafeOwnersDeleteConfirmation
              ownerAddress={selectedOwnerForDeletion}
              onCancel={handleCancel}
              onSuccess={handleSuccessDeletion}
            />
          )}

          {step === SafeOwnersStep.SuccessDeletion && <SafeOwnersSuccessDeletion onBack={handleBack} />}

          {step === SafeOwnersStep.None && (
            <SafeOwnersView
              owners={owners}
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
