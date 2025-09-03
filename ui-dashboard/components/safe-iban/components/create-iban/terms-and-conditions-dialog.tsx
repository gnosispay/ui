"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLineDown,
  Bank,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import { useAccount } from "wagmi";
import Dialog from "@/components/dialog";
import useSafeSigners from "@/hooks/use-safe-signers";
import SafeSignerWarning from "@/components/warnings/safe-signer-warning";
import Button from "../../../buttons/buttonv2";
import { IbanFeatureItem } from "./iban-feature-item";

interface TermsAndConditionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  action: () => void;
  account: `0x${string}`;
}

export const TermsAndConditionsDialog = ({
  isOpen,
  onClose,
  submitting,
  setSubmitting,
  action,
  account,
}: TermsAndConditionsDialogProps) => {
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isConnectedWalletSigner, setIsConnectedWalletSigner] = useState<
    boolean | undefined
  >();

  const { address: connectedAddress } = useAccount();

  const { isSafeSigner } = useSafeSigners({
    safeAddress: account,
    eoaAddress: connectedAddress as `0x${string}`,
  });

  const memoizedIsSafeSigner = useMemo(() => isSafeSigner, [isSafeSigner]);

  useEffect(() => {
    setIsConnectedWalletSigner(undefined);
  }, [connectedAddress]);

  useEffect(() => {
    const checkIsSafeSigner = async () => {
      const canSign = await memoizedIsSafeSigner({
        address: connectedAddress as `0x${string}`,
      });
      setIsConnectedWalletSigner(canSign);
    };

    if (connectedAddress && typeof isConnectedWalletSigner === "undefined") {
      checkIsSafeSigner();
    }
  }, [connectedAddress, memoizedIsSafeSigner, isConnectedWalletSigner]);

  /**
   * Make terms unaccepted after modal closing
   */
  useEffect(() => {
    if (!isOpen) {
      setTermsAccepted(false);
      setSubmitting(false);
    }
  }, [isOpen, setSubmitting]);

  const isIbanGettingDisabled =
    !termsAccepted || submitting || !isConnectedWalletSigner;

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 -mx-4">
        <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
          Get your IBAN
        </h3>
      </div>

      {!isConnectedWalletSigner && <SafeSignerWarning />}

      <div className="flex flex-col gap-8">
        <IbanFeatureItem
          Icon={Bank}
          title="Web3 IBAN"
          description={
            <span>
              Your web3 IBAN makes sending and receiving Euros onchain fast,
              simple, and inexpensive. The IBAN and related services are
              provided by Monerium EMI ehf., a third party electronic money
              institution{" "}
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

        <IbanFeatureItem
          Icon={ArrowLineDown}
          title="Receive"
          description="Transfer Euros to your IBAN from any bank to top up your Gnosis Pay Card. Euros sent to your IBAN are automatically converted into EURe tokens onchain via Monerium."
        />

        <IbanFeatureItem
          Icon={PaperPlaneTilt}
          title="Send"
          description="EURe sent from your Gnosis Pay Card are automatically deposited as Euros in your nominated bank account."
        />
      </div>

      <div className="flex w-full items-center gap-3 text-gp-text-lc">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
          name="terms"
          className="!ring-offset-0 focus:!ring-0 focus:!shadow-none focus:!outline-none border-low-contrast checked:text-black checked:background-white"
        />
        <p className="text-base">
          I accept the{" "}
          <Link
            href="https://monerium.com/policies/personal-terms-of-service/"
            className="underline text-black"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            Monerium terms and conditions
          </Link>
        </p>
      </div>

      <Button
        onClick={action}
        className="w-full"
        disabled={isIbanGettingDisabled}
      >
        {submitting ? "Getting IBAN..." : "Get IBAN"}
      </Button>
    </Dialog>
  );
};
