import { CopySimple, Warning } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { formatUnits } from "viem";
import { isEUOrSwiss } from "@gnosispay/countries";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Swap } from "@phosphor-icons/react/dist/ssr";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import { SUPPORTED_TOKENS } from "@gnosispay/tokens";
import Dialog from "../../../../../components/dialog";
import { GNOSIS_FAUCET_URL } from "../../../../../lib/constants";
import { useClipboardCopy } from "../../../../../hooks/use-clipboard-copy";
import { ExternalExchangeButton } from "../../../../../components/buttons/external-exchange-button";
import Button from "../../../../../components/buttons/buttonv2";
import { shortenAddress } from "../../../../../lib/utils";
import { SwapModal } from "../../../../../components/move-funds/swap-tokens";
import { AddFundsOption } from "../../../../../components/move-funds/add-funds-dialog/add-funds-option";
import { SwapProvider } from "../../../../../components/move-funds/swap-tokens/types";
import type { Me } from "../../../../../lib/get-user";

type FetchBalanceResult = {
  value: bigint;
};

export const WalletDetails = ({
  user,
  userEUReBalance,
  userXDAIBalance,
  userHasEnoughFunds,
}: {
  user: Me | null;
  userEUReBalance: FetchBalanceResult | undefined;
  userXDAIBalance: FetchBalanceResult | undefined;
  userHasEnoughFunds?: boolean;
}) => {
  const { address } = useAccount();
  const [, copy] = useClipboardCopy({ showToast: true });

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showSwapChoice, setShowSwapChoice] = useState(false);
  const [selectedSwapProvider, setSelectedSwapProvider] =
    useState<SwapProvider>(SwapProvider.deBridge);

  const handleSwapOptionClick = useCallback((provider: SwapProvider) => {
    setSelectedSwapProvider(provider);
    setShowSwapModal(true);
    setShowSwapChoice(false);
  }, []);

  if (!address) {
    return null;
  }

  return (
    <div className="space-y-4 grow">
      <h3 className="text-xl">Pay with</h3>

      <div className="bg-white rounded-md border border-tertiary p-4 space-y-4">
        <div className="space-x-2 flex items-center">
          <div className="text-primary flex items-center">
            {address ? shortenAddress(address, 6, 6) : "n/a"}
            <button onClick={() => copy(address)} className="ml-2">
              <CopySimple />
            </button>
          </div>
        </div>
        <hr />
        {!userHasEnoughFunds && (
          <div className="bg-warning-yellow rounded-md border border-warning p-4 text-primary space-x-2 flex">
            <div className="text-warning">
              <Warning size={24} />
            </div>
            <p className="text-primary text-sm">
              You have insufficient balance to complete your order.{" "}
              {user?.country && isEUOrSwiss(user?.country)
                ? `Please
              transfer EURe on Gnosis Chain or get it through deBridge or LI.FI below.
              Please only deposit EURe on Gnosis Chain, this is solely your
              responsibility. If you deposit on another network, your assets may
              be lost.`
                : `Get EURe on Gnosis Chain through Jumper.Exchange below. Clicking the link below will redirect you to their website. Please only deposit EURe on Gnosis Chain, this is solely your responsibility. If you deposit on another network, your assets may be lost.`}
            </p>
          </div>
        )}
        <div className="space-y-4">
          <span className="text-sm text-secondary">Wallet balance</span>
          <div className="space-y-4">
            <div className="space-y-2">
              <Balance amount={userEUReBalance?.value} currency="EURe" />
            </div>
            <div className="space-y-2">
              <Balance
                amount={userXDAIBalance?.value}
                currency="xDAI"
                zeroBalanceLink={
                  <Link
                    href={GNOSIS_FAUCET_URL}
                    target="_blank"
                    className="underline text-secondary text-sm"
                  >
                    Get xDAI
                  </Link>
                }
              />
            </div>
          </div>
        </div>
        {user?.country &&
          (isEUOrSwiss(user?.country as string) ? (
            <div className="space-y-4">
              <Button
                onClick={() => setShowSwapChoice(true)}
                className="w-full py-4"
              >
                <Swap className="text-stone-500 h-5" />
                <span className="text-stone-50">Get EURe</span>
              </Button>
              <div className="text-center">
                <a
                  href="https://help.gnosispay.com/en/articles/8896057-how-to-get-eure-or-gbpe-on-gnosis-chain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  See more options
                </a>
              </div>
            </div>
          ) : (
            <ExternalExchangeButton account={address} tokenSymbol="EURe" />
          ))}
      </div>
      <SwapModal
        safeAddress={address}
        tokenAddress={SUPPORTED_TOKENS["EURe"].address}
        tokenName="EURe"
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onBack={() => {
          setShowSwapModal(false);
          setShowSwapChoice(true);
        }}
        provider={selectedSwapProvider}
      />
      {/* Swap Choice Dialog */}
      <Dialog
        isOpen={showSwapChoice}
        handleClose={() => setShowSwapChoice(false)}
        containerClassName="p-0 max-w-xl bg-bg-secondary"
        absolutelyCentered
      >
        <div>
          <HeadlessDialog.Title className="border-b border-stone-200 p-6">
            <h3 className="text-lg text-center">Get EURe</h3>
          </HeadlessDialog.Title>
          <div className="space-y-4 flex-col p-4">
            <AddFundsOption
              title="Swap with deBridge"
              description="Exchange your crypto for EURe using deBridge"
              onClick={() => {
                handleSwapOptionClick(SwapProvider.deBridge);
              }}
              icon={<Swap className="text-2xl" />}
            />
            <AddFundsOption
              title="Swap with LI.FI"
              description="Exchange your crypto for EURe using LI.FI"
              onClick={() => {
                handleSwapOptionClick(SwapProvider.LiFi);
              }}
              icon={<Swap className="text-2xl" />}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const Balance = ({
  amount,
  currency,
  zeroBalanceLink,
}: {
  amount?: bigint;
  currency: string;
  zeroBalanceLink?: JSX.Element;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Image
          src={`/icon_${currency}.svg`}
          alt={currency}
          width={24}
          height={24}
        />
        <span className="text-primary">{currency}</span>
      </div>
      <div className="flex space-x-2 items-center">
        {(amount ?? 0) <= 0 && zeroBalanceLink}
        <span>
          {Number.parseFloat(formatUnits(amount ?? BigInt(0), 18)).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
