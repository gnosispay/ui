"use client";

import { useState } from "react";
import posthog from "posthog-js";

import Button from "@/components/buttons/button";

import WithdrawFundsDialog from "./withdraw-dialog";
import { AddFundsDialog } from "./add-funds-dialog/index";
import { AddTokensDialog } from "./add-tokens-dialog";

interface MoveFundsButtonProps {
  account: `0x${string}`;
  tokenAddress: `0x${string}`;
  country: string;
  name: string;
  ibanStatus?: string;
  iban?: string;
  bic?: string;
  ibanAvailable: boolean;
  currencyName: string;
}

const MoveFundsButton = ({
  account,
  tokenAddress,
  country,
  name,
  ibanStatus,
  iban,
  bic,
  ibanAvailable,
  currencyName,
}: MoveFundsButtonProps) => {
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isAddTokensDialogOpen, setIsAddTokensDialogOpen] = useState(false);
  const [isWithdrawFundsDialogOpen, setIsWithdrawFundsDialogOpen] =
    useState(false);

  const handleOpenAddFundsDialog = () => {
    posthog.capture("dashboard:open_add_funds_dialog");

    currencyName !== "GBP"
      ? setIsAddFundsDialogOpen(true)
      : setIsAddTokensDialogOpen(true);
  };

  const handleCloseAddFundsDialog = () => {
    posthog.capture("dashboard:close_add_funds_dialog");

    currencyName !== "GBP"
      ? setIsAddFundsDialogOpen(false)
      : setIsAddTokensDialogOpen(false);
  };

  const handleOpenWithdrawFundsDialog = () =>
    setIsWithdrawFundsDialogOpen(true);

  const handleCloseWithdrawFundsDialog = () =>
    setIsWithdrawFundsDialogOpen(false);

  return (
    <div className="flex flex-col sm:flex-row gap-2 border-b sm:border-b-0 w-full sm:w-auto max-w-fit whitespace-nowrap">
      <AddFundsDialog
        isOpen={isAddFundsDialogOpen}
        onClose={handleCloseAddFundsDialog}
        currencyName={currencyName}
        account={account}
        tokenAddress={tokenAddress}
        country={country}
        name={name}
        ibanStatus={ibanStatus}
        iban={iban}
        bic={bic}
        ibanAvailable={ibanAvailable}
      />

      <AddTokensDialog
        isOpen={isAddTokensDialogOpen}
        handleClose={handleCloseAddFundsDialog}
        account={account}
        tokenAddress={tokenAddress}
        country={country}
      />

      <WithdrawFundsDialog
        isOpen={isWithdrawFundsDialogOpen}
        handleClose={handleCloseWithdrawFundsDialog}
        account={account}
      />
      <Button onClick={handleOpenAddFundsDialog}>Add Funds</Button>
      <Button onClick={handleOpenWithdrawFundsDialog}>Send Funds</Button>
    </div>
  );
};

export default MoveFundsButton;
