import React from "react";
import Button from "./buttons/buttonv2";
import Dialog from "./dialog";
import ContinueOnWalletWarning from "./continue-on-wallet-warning";

interface ConfirmDialogProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  closingLabel?: string;
  confirmationLabel?: string;
  isSignatureInProgress?: boolean;
}
const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  description,
  onClose,
  onConfirm,
  closingLabel = "No",
  confirmationLabel = "Yes",
  isSignatureInProgress = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-lg"
      absolutelyCentered
    >
      <div className="p-6 text-center space-y-8">
        <h1 className="text-3xl mt-4 font-brand">{title}</h1>

        {description && <p className="mt-4 text-gray-900">{description}</p>}

        {isSignatureInProgress && <ContinueOnWalletWarning />}

        <div className="mt-4 flex gap-3 flex-col flex-1">
          <Button
            className="w-full py-3 rounded-lg"
            onClick={onConfirm}
            disabled={isSignatureInProgress}
          >
            {confirmationLabel}
          </Button>
          <Button
            className="bg-transparent border border-gp-text-hc text-gp-text-hc w-full py-3 rounded-lg"
            onClick={onClose}
          >
            {closingLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
