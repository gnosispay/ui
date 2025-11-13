import { useState } from "react";
import { useRouter } from "next/navigation";

import { Check, CreditCard, Globe } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import Button from "@/components/buttons/button";
import { TitleSubtitle } from "@/components/layout/title-subtitle";

interface FirstTransactionModalProps {
  isOpen: boolean;
  handleClose: () => void;
  userCountry?: string;
}

const FirstTransactionModal = ({
  isOpen,
  handleClose,
  userCountry,
}: FirstTransactionModalProps) => {
  const { push } = useRouter();

  const [actionExecuting, setActionExecuting] = useState<boolean>(false);

  const triggerAction = () => {
    setActionExecuting(true);
    push("/dashboard");
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName="p-0 max-w-md"
    >
      <div className="mt-12 mx-6">
        <div className="bg-green-brand rounded-full w-16 h-16 flex items-center justify-center m-auto mb-4">
          <Check size={38} />
        </div>
        <TitleSubtitle title="Card activated" />
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-gray-400">
            <CreditCard size={24} className="text-warning" />
          </div>
          <div>
            <h3 className="font-medium text-base">
              Your first payment must be completed using chip and PIN
            </h3>
            <p className="text-sm text-gray-500">
              For your first transaction, please insert your card into the
              payment terminal and enter your PIN.
            </p>
          </div>
        </div>

        {userCountry === "BR" && (
          <div className="flex items-start gap-4 mb-6">
            <div className="text-gray-400">
              <Globe size={24} className="text-warning" />
            </div>
            <div>
              <h3 className="font-medium text-base">
                Use your full name for E-commerce payments
              </h3>
              <p className="text-sm text-gray-500">
                For online payments, please enter your full name under
                "Cardholder Name” exactly as it appears in your account profile.
              </p>
            </div>
          </div>
        )}

        <Button
          loading={actionExecuting}
          disabled={actionExecuting}
          onClick={triggerAction}
          className="w-full"
        >
          Understood
        </Button>
      </div>
    </Dialog>
  );
};

export default FirstTransactionModal;
