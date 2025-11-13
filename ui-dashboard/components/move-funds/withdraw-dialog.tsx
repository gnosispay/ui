"use client";

import { formatUnits, getAddress, parseUnits } from "viem";
import { Listbox } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Coins,
  Warning,
  CursorClick,
} from "@phosphor-icons/react/dist/ssr";

import useAvailableTokens from "@/hooks/use-available-token";
import useDelayRelay from "@/hooks/use-delay-relay";
import useSafeSigners from "@/hooks/use-safe-signers";

import { encodeErc20Transfer } from "@/lib/erc-20";

import Button from "@/components/buttons/button";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import Dialog from "@/components/dialog";
import FormatCurrency from "@/components/format-currency";
import Input from "@/components/inputs/input-base";
import SafeSignerWarning from "@/components/warnings/safe-signer-warning";
import SkeletonLoader from "@/components/skeleton-loader";
import ContinueOnWalletWarning from "../continue-on-wallet-warning";
import type { TokenAmounts } from "@/hooks/use-available-token";

interface SelectedToken {
  address: string;
  amount: bigint | undefined;
  symbol: string;
  decimals: number;
  logoURI: string | undefined;
}

const TokenAmountInput = ({
  tokens,
  onChange,
  selectedToken,
  selectedTokenBalance,
}: {
  tokens: TokenAmounts<string>;
  selectedToken: SelectedToken;
  onChange: (token: SelectedToken) => void;
  selectedTokenBalance: string;
}) => {
  const [amount, setAmount] = useState<string | undefined>();

  const handleTokenSelect = (newToken: SelectedToken) => {
    onChange({
      ...newToken,
      amount: amount ? parseUnits(amount, newToken.decimals) : undefined,
    });
  };

  const handleAmountChange = (amount: string) => {
    setAmount(amount);
    onChange({
      ...selectedToken,
      amount: amount ? parseUnits(amount, selectedToken.decimals) : undefined,
    });
  };

  useEffect(() => {
    if (selectedToken.amount) {
      setAmount(formatUnits(selectedToken.amount, selectedToken.decimals!));
    }
  }, [selectedToken, tokens]);

  return (
    <div className="relative mb-4">
      <Input
        placeholder="0.15"
        className="h-14 [appearance:textfield]"
        type="number"
        value={amount || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleAmountChange(e.target.value)
        }
      />

      <Listbox value={selectedToken} onChange={handleTokenSelect} as="div">
        <div className="absolute right-3 top-2 arrow flex flex-col items-end">
          <Listbox.Button className="flex gap-1 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedToken.logoURI} className="h-5" alt="Token Icon" />
            <span>{selectedToken.symbol}</span>
            <CaretDown />
          </Listbox.Button>
          <div className="gap-1 items-center flex text-xs">
            <span className="text-stone-800">{selectedTokenBalance}</span>
            <button
              className="text-stone-900 font-semibold"
              onClick={() =>
                selectedTokenBalance && handleAmountChange(selectedTokenBalance)
              }
            >
              Max
            </button>
          </div>
        </div>
        <Listbox.Options
          as="div"
          className="bg-white w-full z-50 absolute mt-1 max-h-56 overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5"
        >
          {tokens &&
            Object.values(tokens).map((token) => (
              <Listbox.Option
                key={token.address}
                value={token}
                className="relative cursor-default select-none py-2 pl-3 pr-9 ui-active:bg-gray-200"
                as="div"
              >
                <div className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={token.logoURI} alt="Token Icon" className="h-5" />
                  <span className="ml-1.5 block truncate ui-selected:font-bold">
                    {token.symbol}
                  </span>
                </div>
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </Listbox>
      {amount
        ? Number(amount) > Number(selectedTokenBalance) && (
            <div className="absolute right-0 bottom-[-32px] bg-yellow-100 px-2 py-1 text-yellow-900 text-xs rounded-lg">
              <Coins className="h-4 w-4 inline mr-1" />
              Insufficient balance
            </div>
          )
        : null}
    </div>
  );
};

const AddressInput = ({
  onChange,
  toAddress,
  error,
  connectedAddress,
}: {
  toAddress: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  connectedAddress: `0x${string}`;
}) => {
  const handleMeClick = () => {
    onChange({
      target: { value: connectedAddress },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <>
      <div className="relative">
        <Input
          className="pl-11 text-sm text-gray-700"
          value={toAddress}
          onChange={onChange}
          spellCheck={false}
        />
        <span className="absolute left-3 top-2 text-gray-400 cursor-pointer text-sm">
          gno:
        </span>
        <button
          onClick={handleMeClick}
          className=" cursor-pointer text-gray-400 text-sm mt-1"
        >
          Use connected address
          <CursorClick className="inline-block h-4 w-4 ml-1" />
        </button>

        {error && (
          <div className="absolute right-0 bottom-[-20px] bg-red-100 px-2 py-1 text-red-900 text-xs rounded-lg">
            {error}
          </div>
        )}
      </div>
    </>
  );
};

const WithdrawFundsDialog: React.FC<{
  isOpen: boolean;
  handleClose: () => void;
  account: `0x${string}`;
  initiallySelectedTokenSymbol?: string;
}> = ({ account, isOpen, handleClose, initiallySelectedTokenSymbol }) => {
  const [tab, setTab] = useState("form");
  const [toAddress, setToAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<SelectedToken>();
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<string>("");
  const { isConnected } = useAccount();
  const { delayRelay, isPending, isError } = useDelayRelay(account);
  const { data: availableTokens, isPending: availableTokensLoading } =
    useAvailableTokens(100, account);
  const { address: connectedAddress } = useAccount();
  const [isSigner, setIsSigner] = useState<boolean | undefined>();
  const [isSignatureInProgress, setIsSignatureInProgress] =
    useState<boolean>(false);

  const { isSafeSigner } = useSafeSigners({
    safeAddress: account,
    eoaAddress: (connectedAddress || "") as `0x${string}`,
  });

  useEffect(() => {
    const checkIsSafeSigner = async () => {
      const canSign = await isSafeSigner({
        address: connectedAddress as `0x${string}`,
      });
      setIsSigner(canSign);
    };

    if (typeof isSigner === "undefined") {
      checkIsSafeSigner();
    }
  }, [connectedAddress, isSigner, isSafeSigner]);

  const clearAndClose = () => {
    handleClose();
    setTab("form");
    setToAddress("");
    setAddressError("");
    setSelectedToken(undefined);
  };

  const handleTokenChange = (token: SelectedToken) => {
    setSelectedToken(token);
    const selectedToken = availableTokens[token.address];
    const tokenBalance = selectedToken
      ? formatUnits(selectedToken.amount, selectedToken.decimals)
      : formatUnits(BigInt(0), 18);
    setSelectedTokenBalance(tokenBalance);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setAddressError("");
      getAddress(e.target.value);
    } catch (error) {
      setAddressError("Invalid address");
    }
    setToAddress(e.target.value);
  };

  const handleEnqueue = async () => {
    if (!isSigner) {
      toast.error("You don't have permissions to perform this action");
      return;
    }

    if (!toAddress || !selectedToken?.amount) {return;}

    let data = "0x";
    let to = toAddress;
    let value: bigint | number = selectedToken?.amount;

    if (selectedToken?.symbol !== "xDAI") {
      if (!selectedToken?.address) {return;}
      data = encodeErc20Transfer(toAddress!, selectedToken!.amount!);
      to = selectedToken?.address;
      value = 0;
    }

    setIsSignatureInProgress(true);
    try {
      await delayRelay({
        to,
        data,
        value,
      });
    } catch (e) {}

    setIsSignatureInProgress(false);
    clearAndClose();
  };

  useEffect(() => {
    const getInitiallySelectedToken = () => {
      if (!initiallySelectedTokenSymbol) {
        const [token] = Object.values(availableTokens);
        return token;
      }

      const token = Object.values(availableTokens).find(
        (token) => token.symbol === initiallySelectedTokenSymbol
      );

      if (token) {
        return token;
      }
    };

    const token = getInitiallySelectedToken();
    if (!!token && !selectedToken) {
      setSelectedToken({
        address: token.address,
        amount: undefined,
        symbol: token.symbol,
        decimals: token.decimals,
        logoURI: token.logoURI,
      });

      const selectedToken = availableTokens[token.address];
      const tokenBalance = selectedToken
        ? formatUnits(selectedToken.amount, selectedToken.decimals)
        : formatUnits(BigInt(0), 18);

      setSelectedTokenBalance(tokenBalance);
    }
  }, [availableTokens, selectedToken]);

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={clearAndClose}
      containerClassName="p-0"
      absolutelyCentered
    >
      <div className="border-b border-stone-200 p-6">
        <h3 className="text-lg">Send funds</h3>

        {!isSigner ? (
          <SafeSignerWarning textSize="text-xs" />
        ) : (
          <>
            <p className="text-gp-text-lc">
              {tab === "form" && "Enter the address you wish to send funds to."}
            </p>
            {tab === "form" && (
              <div className="rounded-lg bg-amber-50 p-4 mt-4 border border-amber-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Warning
                      className="h-5 w-5 text-amber-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs font-medium text-stone-900">
                      Please ensure you enter a Gnosis Chain address. User is
                      solely responsible for accuracy of address and safety of
                      their funds.
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {tab === "form" && (
        <div
          className={twMerge(
            "p-6 flex flex-col gap-8",
            !isSigner && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex flex-col gap-1">
            <label className="text-stone-900">To</label>
            <AddressInput
              toAddress={toAddress}
              onChange={handleAddressChange}
              error={addressError}
              connectedAddress={connectedAddress as `0x${string}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            {!selectedTokenBalance ? (
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 -mt-1.5">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Coins
                      className="h-5 w-5 text-amber-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs font-medium text-stone-900">
                      Looks like your wallet is empty! To send funds,
                      you&apos;ll need to top up your account first.
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <label className="text-stone-900">Amount</label>

                <SkeletonLoader
                  isLoading={availableTokensLoading || !selectedToken}
                  className="w-full h-[56px]"
                >
                  {selectedToken && (
                    <TokenAmountInput
                      selectedToken={selectedToken!}
                      selectedTokenBalance={selectedTokenBalance}
                      onChange={handleTokenChange}
                      tokens={availableTokens}
                    />
                  )}
                </SkeletonLoader>
              </>
            )}
          </div>
          <Button
            className="rounded-lg"
            onClick={() => setTab("confirm")}
            disabled={
              !toAddress ||
              Boolean(addressError) ||
              !selectedToken ||
              !selectedToken?.amount ||
              selectedToken?.amount! === BigInt(0)
            }
          >
            Next <ArrowRight className="text-stone-200" />
          </Button>
        </div>
      )}

      {tab === "confirm" && (
        <div className="p-6 flex flex-col gap-4 rounded-lg">
          <div className="bg-stone-50 p-4 rounded-xl">
            <label className="text-stone-800 text-sm">
              You&apos;re sending
            </label>
            <div className="flex gap-2 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedToken?.logoURI}
                className="h-5"
                alt="Token Icon"
              />
              <div>
                <FormatCurrency
                  amount={selectedToken?.amount}
                  decimals={selectedToken?.decimals || 18}
                  integerClassName="text-xl"
                  decimalClassName="text-lg"
                />
              </div>
              <div className="text-lg">{selectedToken?.symbol}</div>
            </div>
          </div>
          <div className="bg-stone-50 p-4 rounded-lg">
            <label className="text-stone-800 text-sm">To</label>
            <div>{toAddress}</div>
          </div>
          <div className="flex items-center px-4 py-5 gap-3 bg-amber-50 p-4 mt-4 border border-amber-100 ">
            <div className="flex-shrink-0">
              <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <div className="text-xs font-medium text-stone-900">
              As a security measure, your card will be temporarily frozen for 3
              minutes.
            </div>
          </div>

          {isSignatureInProgress && (
            <ContinueOnWalletWarning containerClassNames="mb-1" />
          )}

          {isError && (
            <div className="text-red-900 bg-red-200 px-4 py-5 gap-3 rounded-lg text-center">
              Error submitting transaction
            </div>
          )}
          <div className="flex gap-4">
            <Button className="" onClick={() => setTab("form")}>
              <ArrowLeft className="text-stone-100" />
            </Button>
            {isConnected ? (
              <Button
                className="flex-grow"
                onClick={handleEnqueue}
                disabled={isPending || isSignatureInProgress}
                loading={isPending || isSignatureInProgress}
              >
                {isPending ? "Executing" : "Confirm and execute"}
              </Button>
            ) : (
              <ConnectWalletButton className="flex-grow" />
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default WithdrawFundsDialog;
