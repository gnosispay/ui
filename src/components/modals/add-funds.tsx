import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFundsModal = ({ open, onOpenChange }: AddFundsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Add funds</DialogTitle>
        <div className="grid flex-1 gap-2">Add funds</div>
      </DialogContent>
    </Dialog>
  );
};
