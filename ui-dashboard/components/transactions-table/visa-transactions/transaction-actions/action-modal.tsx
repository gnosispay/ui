import { format as formatDate, parseISO } from "date-fns";

import { EventKind } from "@gnosispay/types";
import { useState } from "react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import Button from "@/components/buttons/button";
import Dialog from "@/components/dialog";
import FormatCurrency from "@/components/format-currency";
import type { ModalContent } from ".";

interface ActionModalProps {
  isOpen: boolean;
  modalContent: ModalContent;
  handleClose: () => void;
}

const ActionModal = ({
  isOpen,
  handleClose,
  modalContent,
}: ActionModalProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);


  const {
    title,
    description,
    actionTitle,
    action,
    transaction: { createdAt, merchant, kind, billingCurrency, billingAmount },
  } = modalContent;

  const humanReadableTxDate = formatDate(
    parseISO(createdAt.toString()),
    "MMM d 'at' HH:mm",
  );

  const handleAction = async () => {
    setSubmitting(true);

    try {
      await action();
      handleClose();
      // Support handled via Zendesk
    } catch (error) {
      console.log(error);
    }

    setSubmitting(false);
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        handleClose={handleClose}
        containerClassName="max-w-md"
      >
        <div className="py-1 px-4">
          <h2 className="font-semibold text-xl pb-6 border-b text-stone-900">
            {title}
          </h2>

          <p className="py-6 border-b text-stone-900">{description}</p>

          <div className="text-stone-900 py-6 border-b">
            <div className="flex justify-between">
              <p>
                <span className="text-sm">{humanReadableTxDate}</span>
                <br />
                <span className="text-md font-medium">{merchant.name}</span>
              </p>

              <p className="text-md font-medium mt-6">
                {kind === EventKind.Payment ? "- " : "+ "}
                <FormatCurrency
                  currency={billingCurrency.symbol}
                  decimals={billingCurrency.decimals}
                  amount={billingAmount} //FIXME: check if billing amount is in cents or base units
                />
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleClose}
              className="w-1/2 bg-white text-stone-900 border-stone-900 border focus:border-stone-900"
            >
              Cancel
            </Button>

            <Button
              onClick={handleAction}
              className="w-1/2"
              loading={submitting}
            >
              {submitting ? "Submitting" : actionTitle}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ActionModal;
