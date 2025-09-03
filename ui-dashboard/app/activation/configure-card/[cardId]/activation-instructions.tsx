import Dialog from "@/components/dialog";
import Button from "@/components/buttons/button";

interface ActivationInstructionsProps {
  isOpen: boolean;
  handleClose: () => void;
  successAction: () => void;
}

const ActivationInstructions = ({
  isOpen,
  handleClose,
  successAction,
}: ActivationInstructionsProps) => {
  return (
    <>
      <Dialog
        isOpen={isOpen}
        handleClose={handleClose}
        containerClassName="p-0 max-w-md"
      >
        <div className="p-6">
          <h2 className="font-semibold mb-4">Your card is almost ready!</h2>
          <p className="mb-6">
            Please complete your card activation by withdrawing cash from ATM or
            checking your balance. The final step ensures your card is fully set
            up for use.
          </p>

          <Button onClick={successAction} className="w-full">
            Understood
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default ActivationInstructions;
