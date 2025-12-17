import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { ConfirmationDialog } from "./confirmation-dialog";

interface ReportCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportAsLost: () => void | Promise<void>;
  onReportAsStolen: () => void | Promise<void>;
}

export const ReportCardModal = ({ open, onOpenChange, onReportAsLost, onReportAsStolen }: ReportCardModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLostConfirmation, setShowLostConfirmation] = useState(false);
  const [showStolenConfirmation, setShowStolenConfirmation] = useState(false);

  const handleReportAsLost = useCallback(async () => {
    setIsLoading(true);
    await onReportAsLost();
    onOpenChange(false);
    setIsLoading(false);
  }, [onReportAsLost, onOpenChange]);

  const handleReportAsStolen = useCallback(async () => {
    setIsLoading(true);
    await onReportAsStolen();
    onOpenChange(false);
    setIsLoading(false);
  }, [onReportAsStolen, onOpenChange]);

  const onClickCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset confirmation states when the modal is closed
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setShowLostConfirmation(false);
        setShowStolenConfirmation(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  if (showLostConfirmation) {
    return (
      <ConfirmationDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) setShowLostConfirmation(false);
          onOpenChange(newOpen);
        }}
        title="Report Card as Lost"
        iconColor="text-destructive"
        message="Please note that this is a non-reversible action. Once a card is reported as lost, it cannot be undone."
        confirmText="Report as Lost"
        onConfirm={handleReportAsLost}
        isLoading={isLoading}
      />
    );
  }

  if (showStolenConfirmation) {
    return (
      <ConfirmationDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) setShowStolenConfirmation(false);
          onOpenChange(newOpen);
        }}
        title="Report Card as Stolen"
        iconColor="text-destructive"
        message="Please note that this is a non-reversible action. Once a card is reported as stolen, it cannot be undone."
        confirmText="Report as Stolen"
        onConfirm={handleReportAsStolen}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Report Card</DialogTitle>
        <div className="grid flex-1 gap-4">
          <p className="text-sm text-muted-foreground">Choose how you would like to report your card:</p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => setShowLostConfirmation(true)}
            >
              <div className="text-left">
                <div className="font-medium">Report as Lost</div>
                <div className="text-sm text-muted-foreground">Report your card as lost if you cannot locate it</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => setShowStolenConfirmation(true)}
            >
              <div className="text-left">
                <div className="font-medium">Report as Stolen</div>
                <div className="text-sm text-muted-foreground">
                  Report your card as stolen if it was taken without permission
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={onClickCancel}>
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
