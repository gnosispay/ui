"use client";

import { useState } from "react";

import { IbanCard } from "../shared/iban-card/index";
import { IbanDetailsDialog } from "./iban-details-dialog";

interface IbanDetailsProps {
  name: string;
  iban: string;
  bic: string;
}
export const IbanDetails = ({ name, iban, bic }: IbanDetailsProps) => {
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);

  return (
    <>
      <IbanDetailsDialog
        isOpen={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        name={name}
        iban={iban}
        bic={bic}
      />

      <IbanCard
        title="Your IBAN is ready to use!"
        description="Make your first transfer using your IBAN"
        buttonText="Add funds"
        onClick={() => setDetailsVisible(true)}
        requiresConnectedWallet={false}
      />
    </>
  );
};
