"use client";

import {
  createInnerSignMessageTransaction,
  populateExecuteEnqueue,
} from "@gnosispay/account-kit";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { UserRejectedRequestError } from "viem";

import { ApiError } from "@/lib/api";
import { resetMoneriumData } from "@/app/dashboard/monerium/actions";
import { useMessageSignatureRequests } from "@/hooks/monerium-iban/use-message-signature-requests";
import useSign from "@/hooks/use-sign";
import { IbanCard } from "../shared/iban-card/index";
import { MESSAGE_SIGNING_DETAILS } from "./constants";
import { setupMoneriumProfile } from "./actions";
import { SignatureRequestDialog } from "./signature-request-dialog";
import { TermsAndConditionsDialog } from "./terms-and-conditions-dialog";

const { SIGNING_MESSAGE } = MESSAGE_SIGNING_DETAILS;

interface CreateIbanProps {
  account: `0x${string}`;
  collapsable?: boolean;
  classNames?: string;
  successCallback?: () => void;
  onOAuthSignature?: () => void;
}
export const CreateIban = ({
  account,
  collapsable = true,
  classNames = "",
  successCallback,
  onOAuthSignature,
}: CreateIbanProps) => {
  const sign = useSign();
  const { hasPendingSignatureRequests } = useMessageSignatureRequests(account);

  const [termsVisible, setTermsVisible] = useState<boolean>(false);
  const [signingInProgress, setSigningInProgress] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [ibanGenerationTriggered, setIbanGenerationTriggered] =
    useState<boolean>(false);

  const createIban = async () => {
    try {
      setSubmitting(true);

      setTermsVisible(false);
      setSigningInProgress(true);

      // Always trigger message signing request to get a fresh signature
      const transaction = createInnerSignMessageTransaction(SIGNING_MESSAGE);

      // Get the signed transaction data which contains the signature
      const enqueueTx = await populateExecuteEnqueue(
        { account, chainId: 100 },
        transaction,
        sign,
      );
      const signature = enqueueTx.data;

      // At this point user completed the wallet signature and we hide the modals
      setSigningInProgress(false);
      setTermsVisible(false);

      // Setup Monerium profile with the signature
      await setupMoneriumProfile({
        signature,
      });

      successCallback && successCallback();

      setIbanGenerationTriggered(true);
    } catch (error: any) {
      /**
       * Handle rejected message signature error
       */
      if (error instanceof UserRejectedRequestError) {
        setSigningInProgress(false);
        return;
      }

      /**
       * Monerium profile already exists and we proceed with the OAuth flow
       */
      if (
        error instanceof ApiError &&
        error.externalApiCallStatusCode === 304
      ) {
        onOAuthSignature && onOAuthSignature();

        setTermsVisible(false);
        setSubmitting(false);
        return;
      }

      /**
       * Handle other errors
       */
      console.log(error);
      toast.error("Something went wrong");

      await resetMoneriumData();
      resetModals();
    }
  };

  const resetModals = () => {
    setSubmitting(false);
    setSigningInProgress(false);
    setTermsVisible(true);
  };

  if (ibanGenerationTriggered) {
    return null;
  }

  return (
    <>
      <TermsAndConditionsDialog
        account={account}
        isOpen={termsVisible}
        onClose={() => {
          setTermsVisible(false);
        }}
        submitting={submitting}
        setSubmitting={setSubmitting}
        action={createIban}
      />

      <SignatureRequestDialog
        isOpen={signingInProgress}
        onClose={resetModals}
        onCancel={resetModals}
      />

      <IbanCard
        title="Get your IBAN"
        description="Transfer easily between your bank and Gnosis Pay Card"
        buttonText="Get IBAN"
        onClick={() => setTermsVisible(true)}
        collapsable={collapsable}
        classNames={classNames}
        requiresConnectedWallet={!hasPendingSignatureRequests}
      />
    </>
  );
};
