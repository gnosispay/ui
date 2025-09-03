"use client";

import { useQuery } from "@tanstack/react-query";

import { CreateIban } from "./components/create-iban";
import { IbanDetails } from "./components/iban-details";
import { IbanOAuthCard } from "./components/iban-oauth-card";
import { getBankDetails } from "./actions";

interface SafeIbanProps {
  account: `0x${string}`;
  name?: string | null;
  hasIncomingIbanOrders: boolean;
}
export const SafeIban = ({
  name,
  account,
  hasIncomingIbanOrders,
}: SafeIbanProps) => {
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
  if (ibanStatus === "NOTSTARTED") {
    return <CreateIban account={account} onOAuthSignature={refetch} />;
  }

  /**
   * User has generated IBAN and doesn't have any incoming transfers
   */
  if (ibanStatus === "ASSIGNED" && !hasIncomingIbanOrders) {
    return <IbanDetails name={name!} iban={iban!} bic={bic!} />;
  }

  /**
   * User has pending Monerium OAuth
   */
  if (ibanStatus === "PENDING_OAUTH") {
    return <IbanOAuthCard account={account} />;
  }

  /**
   * IBAN is in pending state (still generating)
   */
  return null;
};
