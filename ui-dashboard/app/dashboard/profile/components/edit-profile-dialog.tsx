import React from "react";
import { Phone, Envelope } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import Button from "@/components/buttons/buttonv2";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  openPhoneNumberDialog: () => void;
  openEditEmailDialog: () => void;
}
const EditProfileDialog = ({
  isOpen,
  onClose,
  openPhoneNumberDialog,
  openEditEmailDialog,
}: EditProfileDialogProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 -mx-4">
        <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
          Edit profile information
        </h3>
      </div>

      <p className="text-primary mt-2">
        Keep your profile information up-to-date with accurate personal
        information and contact details.
      </p>

      <div className="flex flex-col text-center gap-3 mt-2">
        <Button onClick={openPhoneNumberDialog}>
          <Phone />
          Change mobile number
        </Button>

        <Button onClick={openEditEmailDialog}>
          <Envelope />
          Change email
        </Button>
      </div>
    </Dialog>
  );
};

export default EditProfileDialog;
