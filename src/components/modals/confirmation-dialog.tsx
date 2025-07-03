import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  iconColor: string;
  message: string;
  cancelText?: string;
  confirmText: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  iconColor,
  message,
  cancelText = "Cancel",
  confirmText,
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
          {title}
        </DialogTitle>
        <div className="grid flex-1 gap-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <DialogFooter className="justify-end gap-2">
            <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            <Button variant="destructive" disabled={isLoading} onClick={onConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
