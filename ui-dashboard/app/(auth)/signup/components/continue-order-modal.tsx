import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/buttons/button";
import Dialog from "@/components/dialog";

export const ContinueOrderModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { push } = useRouter();

  const [actionExecuting, setActionExecuting] = useState<boolean>(false);

  const triggerAction = () => {
    setActionExecuting(true);
    push("/welcome");
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl"
      absolutelyCentered
    >
      <div className="p-6 text-center space-y-8">
        <h1 className="text-3xl mt-4 font-brand">Continue Your Order</h1>

        <p className="mt-4 text-gray-900">
          It looks like you already have an account with us. Click below to
          continue and finalize your order.
        </p>

        <div className="mt-4 flex gap-3 flex-col flex-1">
          <Button
            className="w-full py-3 rounded-lg"
            onClick={triggerAction}
            loading={actionExecuting}
            disabled={actionExecuting}
          >
            Continue with Your Order
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
