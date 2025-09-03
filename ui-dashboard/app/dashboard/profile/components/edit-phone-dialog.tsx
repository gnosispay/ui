import React from "react";
import Dialog from "@/components/dialog";
import PhoneVerification from "@/components/phone/phone-verification";

interface EditPhoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (...args: any[]) => void;
  phoneNumber?: string;
}
const EditPhoneDialog = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
}: EditPhoneDialogProps) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 -mx-4">
        <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
          Edit mobile number
        </h3>
      </div>

      {phoneNumber && (
        <p className="text-primary">
          Your current mobile number:{" "}
          <span className="font-medium">{phoneNumber}</span>
        </p>
      )}

      <p className="text-primary">
        One Time Password (OTP) verifications for online transactions will be
        sent to the new mobile number once updated.
      </p>

      <PhoneVerification
        userPhoneNumber={""}
        onSuccess={onSuccess}
        onVerificationDialogClose={onClose}
      />
    </Dialog>
  );
};

export default EditPhoneDialog;
