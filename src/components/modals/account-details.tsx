import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SafeAccountDetails } from "../account/SafeAccountDetails";

interface AccountDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountDetailsModal = ({ open, onOpenChange }: AccountDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Account details</DialogTitle>
        </DialogHeader>

        <SafeAccountDetails />
      </DialogContent>
    </Dialog>
  );
};
