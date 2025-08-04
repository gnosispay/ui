import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GenericModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export const GenericModal: React.FC<GenericModalProps> = ({ open, onOpenChange, title, content }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-muted-foreground">{content}</div>
      </DialogContent>
    </Dialog>
  );
};
