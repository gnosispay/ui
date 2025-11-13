"use client";

import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import Button from "../../../buttons/buttonv2";

interface SignatureRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
}

export const SignatureRequestDialog = ({
  isOpen,
  onClose,
  onCancel,
}: SignatureRequestDialogProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="flex pt-12">
        <p className="text-3xl text-center w-full">
          Sign the signature request <br /> in your wallet to continue
        </p>
      </div>

      <p className="flex justify-center items-center gap-1">
        <CircleNotch className="text-green-brand text-xl animate-spin" />
        Waiting for signature
      </p>

      <Button onClick={onCancel} className="w-full">
        Cancel
      </Button>
    </Dialog>
  );
};
