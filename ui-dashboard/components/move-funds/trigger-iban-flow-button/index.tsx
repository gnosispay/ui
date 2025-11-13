"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Bank } from "@phosphor-icons/react/dist/ssr";
import { CreateIban } from "@/components/safe-iban/components/create-iban";
import { getBankDetails } from "@/components/safe-iban/actions";
import { IbanOAuthCard } from "@/components/safe-iban/components/iban-oauth-card";
import { AddFundsOption } from "../add-funds-dialog/add-funds-option";

interface TriggerIbanFlowButtonProps {
  safeAddress: `0x${string}`;
}
export const TriggerIbanFlowButton = ({
  safeAddress,
}: TriggerIbanFlowButtonProps) => {
  const [ibanGenerationTriggered, setIbanGenerationTriggered] =
    useState<boolean>(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ibanData"],
    queryFn: getBankDetails,
  });
  const { ibanStatus } = data?.data || {};

  if (isLoading) {
    return null;
  }

  /**
   * User still hasn't started generating IBAN
   */
  if (ibanStatus === "NOTSTARTED" && !ibanGenerationTriggered) {
    return (
      <CreateIban
        account={safeAddress}
        collapsable={false}
        classNames="md:max-w-full"
        successCallback={() => setIbanGenerationTriggered(true)}
        onOAuthSignature={refetch}
      />
    );
  }

  /**
   * User has pending Monerium OAuth
   */
  if (ibanStatus === "PENDING_OAUTH") {
    return (
      <IbanOAuthCard
        account={safeAddress}
        collapsable={false}
        classNames="md:max-w-full"
      />
    );
  }

  /**
   * User has pending Monerium IBAN creation
   */
  if (ibanStatus === "PENDING" || ibanGenerationTriggered) {
    return (
      <AddFundsOption
        title="Bank transfer"
        description="Generating your IBAN..."
        icon={<Bank className="text-2xl" />}
        disabled
      />
    );
  }

  return null;
};
