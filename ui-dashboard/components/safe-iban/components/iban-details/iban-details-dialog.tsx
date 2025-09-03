"use client";

import { Check, Export } from "@phosphor-icons/react/dist/ssr";

import { toast } from "react-hot-toast";
import { friendlyFormatIBAN } from "ibantools";
import Dialog from "@/components/dialog";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import Button from "../../../buttons/buttonv2";
import { IbanDetailsItem } from "./iban-details-item";
import { IbanInfoItem } from "./iban-info-item";

interface IbanDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  iban: string;
  bic: string;
}

export const IbanDetailsDialog = ({
  isOpen,
  onClose,
  name,
  iban,
  bic,
}: IbanDetailsDialogProps) => {
  const [, copy] = useClipboardCopy({ showToast: true });

  const handleShare = () => {
    try {
      const shareData = {
        title: "Payment Instructions",
        text: `Beneficiary: ${name}\nIBAN: ${iban}\nBIC: ${bic}`,
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        copy(shareData.text);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 -mx-4">
        <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
          Bank Transfer
        </h3>
      </div>

      <div className="bg-green-brand rounded-full w-16 h-16 flex items-center justify-center m-auto">
        <Check size={38} />
      </div>

      <div className="text-center">
        <p className="text-3xl font-normal">
          All set! Your IBAN is ready to use
        </p>
        <p className="text-base font-normal mt-2">
          Use these account details to send Euros to your Gnosis Pay Card
          account
        </p>
      </div>

      <IbanDetailsItem title="Beneficiary" value={name} />
      <IbanDetailsItem title="IBAN" value={friendlyFormatIBAN(iban)!} />
      <IbanDetailsItem title="BIC" value={bic} />

      <Button onClick={handleShare} className="w-full">
        <Export size={20} />
        Share
      </Button>

      <div className="flex flex-col gap-4 bg-tertiary px-4 py-6">
        <IbanInfoItem text="Counterpart bank may charge for international payments." />
        <IbanInfoItem text="All transfers go through SEPA Instant. SEPA Standard is used when the counterpart bank does not support SEPA Instant, or the amount exceeds 100,000 EUR." />
        <IbanInfoItem text="Instant payments are available 24/7, 365 days a year. SEPA Standard may take up to one business day." />
        <IbanInfoItem
          text={
            <span>
              The IBAN and related services are provided by Monerium EMI ehf., a
              third party electronic money institution{" "}
              <a
                href="https://en.fme.is/supervision/supervised-entities/"
                target="_blank"
                className="underline"
              >
                authorised by the Financial Supervisory Authority of the Central
                Bank of Iceland
              </a>
              .
            </span>
          }
        />
      </div>
    </Dialog>
  );
};
