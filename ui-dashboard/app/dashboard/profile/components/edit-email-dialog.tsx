import React from "react";
import { useSession } from "next-auth/react";
import Dialog from "@/components/dialog";
import EmailVerification from "@/components/email/email-verification";

interface EditEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEmailDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: EditEmailDialogProps) => {
  const { data: session } = useSession();

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 -mx-4">
        <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
          Edit email
        </h3>
      </div>

      {session?.user?.email && (
        <>
          <EmailVerification
            userId={session.user.id}
            oldEmail={session.user.email}
            onVerificationSuccess={onSuccess}
          />
        </>
      )}
    </Dialog>
  );
};

export default EditEmailDialog;
