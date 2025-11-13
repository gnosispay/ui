import { useEffect, useState } from "react";

import { TOKEN_BY_ADDRESS } from "@gnosispay/tokens";
import Dialog from "../../dialog";
import { DetailsTab } from "./details-tab";
import { SwapTab } from "./swap-tab";
import { AddTokensDialogTab } from "./types";

interface AddTokensDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  account: `0x${string}`;
  tokenAddress: `0x${string}`;
  country: string;
  openTab?: AddTokensDialogTab;
}

export const AddTokensDialog = ({
  isOpen,
  handleClose,
  account,
  tokenAddress,
  country,
  openTab = AddTokensDialogTab.Details,
}: AddTokensDialogProps) => {
  const [tab, setTab] = useState<AddTokensDialogTab | undefined>(openTab);

  useEffect(() => {
    setTab(openTab);
  }, [openTab]);

  const tokenSymbol = TOKEN_BY_ADDRESS[tokenAddress]?.symbol;

  return (
    <Dialog isOpen={isOpen} handleClose={handleClose} containerClassName="p-0">
      <div className="border-b border-stone-200 p-6">
        <h3 className="text-lg">Add funds to your wallet</h3>
        <p className="text-gp-text-lc">
          Send {tokenSymbol} directly to your Gnosis Pay Safe Account
        </p>
      </div>

      {tab === AddTokensDialogTab.Details && (
        <DetailsTab
          country={country}
          account={account}
          changeTab={setTab}
          tokenSymbol={tokenSymbol}
        />
      )}

      {tab === AddTokensDialogTab.Swap && (
        <SwapTab
          account={account}
          changeTab={setTab}
          tokenAddress={tokenAddress}
        />
      )}
    </Dialog>
  );
};
