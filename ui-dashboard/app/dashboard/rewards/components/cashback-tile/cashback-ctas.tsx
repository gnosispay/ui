import { useState } from "react";
import Button from "@/components/buttons/buttonv2";
import WithdrawFundsDialog from "@/components/move-funds/withdraw-dialog";
import { GNO_TOKEN_ADDRESS } from "@/lib/constants";
import { SwapModal } from "@/components/move-funds/swap-tokens";
import { SwapProvider } from "@/components/move-funds/swap-tokens/types";
import { DepositGNOModal } from "../deposit-gno-modal";
import { JoinCashbackModal } from "../join-cashback-modal";
import { WalletTransferModal } from "../wallet-transfer-modal";
import { SwapGNOModal } from "../swap-gno-modal";

export const CashbackCtas = ({
  safeAddress,
  optedInCashback,
  isUserFromUK,
}: {
  safeAddress?: string;
  optedInCashback?: boolean;
  isUserFromUK?: boolean;
}) => {
  const [isCashbackJoinOpen, setIsCashbackJoinOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWalletTransferOpen, setIsWalletTransferOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isSwapChoiceOpen, setIsSwapChoiceOpen] = useState(false);
  const [selectedSwapProvider, setSelectedSwapProvider] =
    useState<SwapProvider>(SwapProvider.deBridge);

  const handleSwapOpen = (provider: SwapProvider) => {
    setSelectedSwapProvider(provider);
    setIsSwapChoiceOpen(false);
    setIsSwapOpen(true);
  };

  if (!safeAddress) {
    return <span>You need to activate your card to use Cashback</span>;
  }

  if (optedInCashback) {
    return (
      <>
        <div className="md:space-x-4 space-y-4 md:space-y-0 flex-1 flex flex-col md:flex-row">
          <Button
            className="flex-1"
            onClick={() =>
              isUserFromUK
                ? setIsWalletTransferOpen(true)
                : setIsDepositOpen(true)
            }
          >
            Top up GNO
          </Button>
          <Button className="flex-1" onClick={() => setIsWithdrawOpen(true)}>
            Withdraw GNO
          </Button>
        </div>
        <WithdrawFundsDialog
          isOpen={isWithdrawOpen}
          handleClose={() => setIsWithdrawOpen(false)}
          account={safeAddress as `0x${string}`}
          initiallySelectedTokenSymbol="GNO"
        />
        <DepositGNOModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onWalletTransferOpen={() => {
            setIsDepositOpen(false);
            setIsWalletTransferOpen(true);
          }}
          onSwapOpen={() => {
            setIsDepositOpen(false);
            setIsSwapChoiceOpen(true);
          }}
        />
        <WalletTransferModal
          safeAddress={safeAddress}
          isOpen={isWalletTransferOpen}
          onClose={() => setIsWalletTransferOpen(false)}
          onBack={() => {
            setIsWalletTransferOpen(false);
            setIsDepositOpen(true);
          }}
        />
        <SwapGNOModal
          isOpen={isSwapChoiceOpen}
          onClose={() => setIsSwapChoiceOpen(false)}
          onSwapOpen={handleSwapOpen}
        />
        <SwapModal
          safeAddress={safeAddress}
          tokenAddress={GNO_TOKEN_ADDRESS}
          tokenName="GNO"
          isOpen={isSwapOpen}
          provider={selectedSwapProvider}
          onClose={() => setIsSwapOpen(false)}
          onBack={() => {
            setIsSwapOpen(false);
            setIsSwapChoiceOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Button className="flex-1" onClick={() => setIsCashbackJoinOpen(true)}>
        Join cashback program
      </Button>
      <JoinCashbackModal
        isOpen={isCashbackJoinOpen}
        onClose={() => {
          setIsCashbackJoinOpen(false);
          setIsDepositOpen(true);
        }}
      />
    </>
  );
};
