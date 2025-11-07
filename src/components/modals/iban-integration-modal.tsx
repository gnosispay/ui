import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IbanIntegrationFlow } from "@/components/iban/iban-integration-flow";

interface IbanIntegrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IbanIntegrationModal({ isOpen, onOpenChange }: IbanIntegrationModalProps) {
  const [showSuccessState, setShowSuccessState] = useState(false);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setShowSuccessState(false);
  }, [onOpenChange]);

  const handleSuccess = useCallback(() => {
    setShowSuccessState(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="iban-integration-modal">
        <DialogHeader>
          <DialogTitle>{showSuccessState ? "IBAN Created Successfully!" : "Create Your IBAN"}</DialogTitle>
        </DialogHeader>

        <IbanIntegrationFlow onSuccess={handleSuccess} onCancel={handleClose} showCancelButton={true} />

        {showSuccessState && (
          <div className="flex justify-end pt-4">
            <Button
              className="bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
