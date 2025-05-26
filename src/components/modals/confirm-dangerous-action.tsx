import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";

interface ConfirmDangerousActionModalProps {
  onClose: () => void;
  action: () => void | Promise<void>;
  message: string;
}

export const ConfirmDangerousActionModal = ({ action, message, onClose }: ConfirmDangerousActionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  const onDoIt = useCallback(async () => {
    setIsLoading(true);
    await action();
    onOpenChange(false);
    setIsLoading(false);
  }, [action, onOpenChange]);

  const onClickNo = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Are you sure?</DialogTitle>
        <div className="grid flex-1 gap-2">
          {message}
          <DialogFooter className="justify-end">
            <Button disabled={isLoading} onClick={onClickNo}>
              No
            </Button>
            <Button variant="outline" disabled={isLoading} loading={isLoading} onClick={onDoIt}>
              Yes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
