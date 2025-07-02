import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ReportCardModalProps {
  onClose: () => void;
  onReportAsLost: () => void | Promise<void>;
  onReportAsStolen: () => void | Promise<void>;
}

export const ReportCardModal = ({ onClose, onReportAsLost, onReportAsStolen }: ReportCardModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLostConfirmation, setShowLostConfirmation] = useState(false);
  const [showStolenConfirmation, setShowStolenConfirmation] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

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

  if (showLostConfirmation) {
    return (
      <Dialog open={true} onOpenChange={() => setShowLostConfirmation(false)}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Card as Lost
          </DialogTitle>
          <div className="grid flex-1 gap-4">
            <p className="text-sm text-muted-foreground">
              Please note that this is a non-reversible action. Once a card is reported as lost, it cannot be undone.
            </p>
            <DialogFooter className="justify-end gap-2">
              <Button variant="outline" disabled={isLoading} onClick={() => setShowLostConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={isLoading} onClick={handleReportAsLost}>
                Report as Lost
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showStolenConfirmation) {
    return (
      <Dialog open={true} onOpenChange={() => setShowStolenConfirmation(false)}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Report Card as Stolen
          </DialogTitle>
          <div className="grid flex-1 gap-4">
            <p className="text-sm text-muted-foreground">
              Please note that this is a non-reversible action. Once a card is reported as stolen, it cannot be undone.
            </p>
            <DialogFooter className="justify-end gap-2">
              <Button variant="outline" disabled={isLoading} onClick={() => setShowStolenConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={isLoading} onClick={handleReportAsStolen}>
                Report as Stolen
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
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
