"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { CreateIban } from "@/components/safe-iban/components/create-iban";
import { getBankDetails } from "@/components/safe-iban/actions";
import { IbanOAuthCard } from "@/components/safe-iban/components/iban-oauth-card";
import ProfileSection from "../../../components/profile-section";
import { IbanDetails } from "./iban-details";

interface SafeIbanProps {
  safeAddress: `0x${string}`;
  name?: string | null;
}
export const SafeIban = ({ safeAddress, name }: SafeIbanProps) => {
  const [ibanGenerationTriggered, setIbanGenerationTriggered] =
    useState<boolean>(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ibanData"],
    queryFn: getBankDetails,
  });
  const { iban, bic, ibanStatus } = data?.data || {};

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
   * IBAN is in pending state (still generating)
   */
  if (ibanStatus === "PENDING" || ibanGenerationTriggered) {
    return (
      <ProfileSection title="IBAN">
        <p className="text-gp-text-lc">Generating IBAN...</p>
      </ProfileSection>
    );
  }

  /**
   * User has generated IBAN
   */
  if (ibanStatus === "ASSIGNED") {
    return <IbanDetails name={name!} iban={iban!} bic={bic!} />;
  }

  return null;
};
