"use client";

import { toast } from "react-hot-toast";
import { useMessageSignatureRequests } from "@/hooks/monerium-iban/use-message-signature-requests";
import { IbanCard } from "../shared/iban-card/index";
import { getMoneriumRedirectUrl } from "../create-iban/actions";

interface IbanOAuthCardProps {
  account: `0x${string}`;
  collapsable?: boolean;
  classNames?: string;
}
export const IbanOAuthCard = ({
  account,
  collapsable = true,
  classNames = "",
}: IbanOAuthCardProps) => {
  const { hasPendingSignatureRequests } = useMessageSignatureRequests(account);

  const handleMoneriumOAuthRedirect = async () => {
    try {
      const {
        data: {
          data: { redirectUrl },
        },
      } = await getMoneriumRedirectUrl();

      window.location.href = redirectUrl;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <IbanCard
      title="Connect your IBAN"
      description="You already have a Monerium account. After the message signing request is done, click below to link your IBAN with Gnosis Pay."
      buttonText="Link IBAN"
      onClick={handleMoneriumOAuthRedirect}
      actionDisabled={hasPendingSignatureRequests}
      collapsable={collapsable}
      classNames={classNames}
    />
  );
};
