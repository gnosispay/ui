import { SUPPORT_EMAIL } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback } from "react";

interface SupportContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportContactModal = ({ open, onOpenChange }: SupportContactModalProps) => {
  const handleEmailClick = useCallback(() => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`;
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="support-contact-modal">
        <DialogHeader>
          <DialogTitle>Contact support</DialogTitle>
          <DialogDescription>
            You can either log in to get access to our support, or write an email to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-medium text-foreground">
              {SUPPORT_EMAIL}
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleEmailClick} data-testid="support-contact-email-button">
            Write an email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
