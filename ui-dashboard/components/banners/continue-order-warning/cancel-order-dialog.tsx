import Button from "@/components/buttons/button";
import Dialog from "@/components/dialog";

interface CancelOrderDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onOrderCancel: () => void;
}

export const CancelOrderDialog = ({
  isOpen,
  handleClose,
  onOrderCancel,
}: CancelOrderDialogProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName="p-0 max-w-md"
    >
      <div className="p-6">
        <h2 className="font-semibold mb-4">Order Cancellation Confirmation</h2>
        <p className="mb-2">
          By canceling, your current card order will be discarded.
        </p>
        <p className="mb-6">
          You&apos;ll need to start a new order from scratch if you want to
          order a new card.
        </p>

        <Button onClick={onOrderCancel} className="w-full bg-red-600">
          Cancel Card Order
        </Button>
      </div>
    </Dialog>
  );
};
