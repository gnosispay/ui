"use client";

import React, { useState } from "react";
import { ArrowLineDown, Bank, Swap } from "@phosphor-icons/react/dist/ssr";
import { IbanDetailsDialog } from "@/components/safe-iban/components/iban-details/iban-details-dialog";
import Dialog from "@/components/dialog";
import { TriggerIbanFlowButton } from "@/components/move-funds/trigger-iban-flow-button";
import { SwapProvider } from "@/components/move-funds/swap-tokens/types";
import { AddTokensDialog } from "../add-tokens-dialog";
import { SwapModal } from "../swap-tokens";
import { AddTokensDialogTab } from "../add-tokens-dialog/types";
import { AddFundsOption } from "./add-funds-option";

interface AddFundsDialogProps {
  isOpen: boolean;
  currencyName: string;
  onClose: () => void;
  account: `0x${string}`;
  tokenAddress: `0x${string}`;
  country: string;
  name: string;
  ibanStatus?: string;
  iban?: string;
  bic?: string;
  ibanAvailable: boolean;
}
export const AddFundsDialog = ({
  isOpen,
  onClose,
  currencyName,
  name,
  account,
  tokenAddress,
  country,
  ibanStatus,
  iban,
  bic,
  ibanAvailable,
}: AddFundsDialogProps) => {
  const [bankTransferDialogOpen, setBankTransferDialogOpen] =
    useState<boolean>(false);
  const [addTokensDialogOpen, setAddTokensDialogOpen] =
    useState<boolean>(false);
  const [swapTokensDialogOpen, setSwapTokensDialogOpen] =
    useState<boolean>(false);
  const [selectedSwapProvider, setSelectedSwapProvider] =
    useState<SwapProvider>(SwapProvider.deBridge);
  const [addTokensDialogActiveTab, setAddTokensDialogActiveTab] = useState<
    AddTokensDialogTab | undefined
  >(undefined);

  const openBankTransferDialog = () => {
    setBankTransferDialogOpen(true);
    onClose();
  };

  const openAddTokensDialog = () => {
    setAddTokensDialogActiveTab(AddTokensDialogTab.Details);
    setAddTokensDialogOpen(true);
    onClose();
  };

  const openTokenSwap = (provider: SwapProvider) => {
    setSelectedSwapProvider(provider);
    setSwapTokensDialogOpen(true);
    onClose();
  };

  return (
    <>
      <SwapModal
        safeAddress={account}
        tokenAddress={tokenAddress}
        tokenName={currencyName}
        isOpen={swapTokensDialogOpen}
        onClose={() => setSwapTokensDialogOpen(false)}
        backEnabled={false}
        provider={selectedSwapProvider}
      />

      <IbanDetailsDialog
        name={name!}
        iban={iban!}
        bic={bic!}
        isOpen={bankTransferDialogOpen}
        onClose={() => setBankTransferDialogOpen(false)}
      />

      <AddTokensDialog
        isOpen={addTokensDialogOpen}
        handleClose={() => setAddTokensDialogOpen(false)}
        account={account}
        tokenAddress={tokenAddress}
        country={country}
        openTab={addTokensDialogActiveTab}
      />

      <Dialog
        isOpen={isOpen}
        handleClose={onClose}
        containerClassName="p-0 px-6 pb-6 bg-bg-secondary max-w-lg space-y-6"
      >
        <div className="border-b border-stone-200 pb-4 -mx-4">
          <h3 className="text-lg font-medium text-primary text-center -mt-0.5">
            Add funds
          </h3>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {ibanAvailable && ibanStatus === "ASSIGNED" && (
            <AddFundsOption
              title="Bank transfer"
              description="Send Euros from your bank account • Up to 1 day"
              icon={<Bank className="text-2xl" />}
              onClick={openBankTransferDialog}
            />
          )}

          {ibanAvailable && ibanStatus !== "ASSIGNED" && (
            <TriggerIbanFlowButton safeAddress={account} />
          )}

          <AddFundsOption
            title={`Top up ${currencyName}`}
            description={`Send ${currencyName} to your Gnosis Card account • ~5 mins`}
            icon={<ArrowLineDown className="text-2xl" />}
            onClick={openAddTokensDialog}
          />

          <AddFundsOption
            title={`Swap tokens via deBridge`}
            description={`Exchange your crypto for ${currencyName} • ~5 mins`}
            icon={<Swap className="text-2xl" />}
            onClick={() => openTokenSwap(SwapProvider.deBridge)}
          />
          <AddFundsOption
            title={`Swap tokens via LI.FI`}
            description={`Exchange your crypto for ${currencyName} • ~5 mins`}
            icon={<Swap className="text-2xl" />}
            onClick={() => openTokenSwap(SwapProvider.LiFi)}
          />
        </div>
      </Dialog>
    </>
  );
};
