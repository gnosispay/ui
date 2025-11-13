"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAccount, useSwitchChain } from "wagmi";
import { SUPPORTED_TOKENS } from "@gnosispay/tokens";
import { getGnosisAddressUrl } from "@/lib/constants";
import useHasMounted from "@/hooks/use-has-mounted";
import useAccountSetup from "@/hooks/use-account-setup";
import useAccountQuery from "@/hooks/use-account-query";
import Spinner from "@/components/spinner";
import Button from "@/components/buttons/buttonv2";
import Buttonv1 from "@/components/buttons/button";
import { fetchApi } from "@/lib/api";
import { shortenAddress } from "@/lib/utils";
import { useSafeAccountAddress } from "../../lib/use-safe-account-address";
import { PAYMENT_CHAIN_ID } from "../../lib/constants";
import { validateSafeConfiguration } from "./actions";
import type { TokenSymbol } from "@gnosispay/prisma/client";

export const SwitchToGnosisButton = ({ className }: { className?: string }) => {
  const { switchChain } = useSwitchChain();
  const hasMounted = useHasMounted();
  if (!hasMounted) {
    return null;
  }

  const switchToGnosisChain = () => {
    try {
      switchChain && switchChain({ chainId: 100 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch to Gnosis Chain");
    }
  };

  return (
    <Buttonv1 onClick={switchToGnosisChain} className={className}>
      Switch to Gnosis Chain
    </Buttonv1>
  );
};

export const ConfigureSafeButton = ({ className }: { className?: string }) => {
  const { chain: activeWalletChain } = useAccount();
  const isGnosisChain = activeWalletChain?.id === 100;

  const params = useParams();
  const { data: safeCurrency, refetch } = useQuery({
    queryKey: ["api/v1/safe/set-currency"],
    queryFn: async () => {
      const { data } = await fetchApi("/safe/set-currency", { method: "POST" });
      return data;
    },
    enabled: false,
    staleTime: Infinity,
  });

  const { data: userSafeConfig } = useQuery({
    queryKey: ["api/v1/safe-config"],
    queryFn: async () => {
      const { data } = await fetchApi("/safe-config");
      return data;
    },
    refetchInterval: (query) => (query.state.data?.isDeployed ? false : 2000),
    staleTime: Infinity,
  });

  const tokenSymbol = safeCurrency?.tokenSymbol as TokenSymbol;
  const currencyTokenAddress = SUPPORTED_TOKENS[tokenSymbol]?.address;

  // gets the address of a safe that was deployed during the order of a card
  const { safeAccountAddress: safeAddress, error: safeAccountAddressError } =
    useSafeAccountAddress(PAYMENT_CHAIN_ID.toString());
  const { isConnected, address: eoaAddress } = useAccount();
  const { data: accountQuery } = useAccountQuery(safeAddress || undefined);
  const [isBareSafe, setIsBareSafe] = useState(true);
  const [hasSingleOwner, setHasSingleOwner] = useState(false);
  const [hasZeroModules, setHasZeroModules] = useState(false);
  const [hasLoadedSafeState, setHasLoadedSafeState] = useState(false);
  const [isSafeOwner, setIsSafeOwner] = useState(false);
  const [safeOwner, setSafeOwner] = useState<`0x${string}` | null>(null);
  const [isSafeCorrectlyConfigured, setIsSafeCorrectlyConfigured] =
    useState(false);
  const {
    setupAccount,
    error,
    isLoading,
    isWaitingForUser,
    isExecuting,
    isSuccess,
  } = useAccountSetup(safeAddress || undefined, currencyTokenAddress);

  const isSafeDeployed = userSafeConfig?.isDeployed || false;

  // not used -> want to move to more procedural flow
  // Check if the safe is in a good state to be configured
  // check wether safe is deployed before refetch
  useEffect(() => {
    safeAddress &&
      eoaAddress &&
      isSafeDeployed &&
      validateSafeConfiguration(safeAddress)
        .then(
          ({ isValidInferred, hasASingleOwner, hasZeroModules, safeOwner }) => {
            setHasSingleOwner(hasASingleOwner);
            setHasZeroModules(hasZeroModules);
            setIsBareSafe(isValidInferred);
            setSafeOwner(safeOwner ?? null);
            setIsSafeOwner(safeOwner === eoaAddress);
            setHasLoadedSafeState(true);
          },
        )
        .catch((e) => {
          console.error(`Error validating safe configuration: ${e}`);
          setHasLoadedSafeState(true);
        });
  }, [safeAddress, isSafeDeployed, eoaAddress, setIsSafeOwner]);

  // retrigger user data fetch after signing in
  useEffect(() => {
    if (safeAddress) {
      refetch();
    }
  }, [safeAddress, refetch]);

  // Check if the safe is already configured
  // check wether safe is deployed before refetch
  useEffect(() => {
    if (accountQuery?.status === 0) {
      setIsSafeCorrectlyConfigured(true);
    }
  }, [accountQuery]);

  // Check if the safe is correctly configured after the setup transaction
  useEffect(() => {
    if (isSuccess) {
      setIsSafeCorrectlyConfigured(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isWaitingForUser) {
      toast.loading("Sign transaction in your wallet", { duration: 3000 });
    }
    if (isExecuting) {
      toast.loading("Transaction pending", { duration: 10000 });
    }
    if (isSuccess) {
      toast.success("Transaction successful", { duration: 4000 });
    }
  }, [isWaitingForUser, isExecuting, isSuccess]);

  // only show misconfiguration warnings if the safe state has been loaded and it's not in valid state
  const showMisconfigurationWarnings =
    hasLoadedSafeState && !isSafeCorrectlyConfigured;

  const showConfigureSafeButton =
    isConnected && isGnosisChain && !isSafeCorrectlyConfigured && safeAddress;

  const showSafeConfigIssue =
    safeAddress && !isBareSafe && !isSafeCorrectlyConfigured;

  const showSafeOwnerIssue = hasLoadedSafeState && !isSafeOwner;

  const disableSetupSafeButton =
    !safeAddress ||
    isLoading ||
    !isGnosisChain ||
    !isBareSafe ||
    !isSafeDeployed ||
    !isSafeOwner;

  return (
    <>
      <div className="mt-2 flex flex-col gap-3 items-end">
        <div className="relative">
          <div className="mt-2">
            {isConnected && !isGnosisChain && <SwitchToGnosisButton />}
          </div>
          {isSafeCorrectlyConfigured && (
            <Link
              href={`/activation/configure-card/${params?.cardId}`}
              passHref
            >
              <Button className="mt-2">Next</Button>
            </Link>
          )}
          {showConfigureSafeButton && (
            <Button
              className={className}
              onClick={setupAccount}
              disabled={disableSetupSafeButton}
            >
              {(isLoading || !isSafeDeployed) && (
                <Spinner monochromatic className="w-3 h-3" />
              )}
              {isLoading ? "Setting Up" : "Set up"}
              <span className="text-emerald-400 text-base font-medium">
                Safe
              </span>
            </Button>
          )}
        </div>

        <div className="text-sm">{error}</div>
        {showSafeConfigIssue && (
          <div className="text-sm text-red-500 mt-2">
            It looks like your Safe is not in a good state to be configured.
            <br />
            Please contact support.
          </div>
        )}

        {showMisconfigurationWarnings && !hasSingleOwner && (
          <div className="text-sm text-red-500 mt-2">
            It looks like your Safe has more than one owner.
            <br />
            Please contact support.
          </div>
        )}

        {showMisconfigurationWarnings && !hasZeroModules && (
          <div className="text-sm text-red-500 mt-2">
            It looks like your Safe has modules.
            <br />
            Please contact support.
          </div>
        )}

        {(!safeAddress || safeAccountAddressError) && (
          <div className="text-sm text-red-500 mt-2">
            {safeAccountAddressError
              ? safeAccountAddressError
              : "Something went wrong while loading your Safe."}
            <br />
            Please contact support.
          </div>
        )}

        {showSafeOwnerIssue && (
          <div className="text-sm text-red-500 mt-1 break-words overflow-hidden w-1/2">
            The wallet you are signed in with is not the Safe owner.
            <br />
            {!!safeOwner && (
              <>
                Please connect wallet{" "}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  href={getGnosisAddressUrl(safeOwner)}
                >
                  {shortenAddress(safeOwner)}
                </Link>{" "}
                to complete the Safe setup.
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ConfigureSafeButton;
