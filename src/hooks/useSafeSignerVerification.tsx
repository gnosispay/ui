import { useState, useCallback, useMemo, useEffect } from "react";
import type { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { predictAddresses, getAccountOwners } from "@gnosispay/account-kit";
import { useUser } from "@/context/UserContext";

interface UseSafeSignerVerificationResult {
  isSignerConnected: boolean;
  signerError: Error | null;
  isDataLoading: boolean;
}

export const useSafeSignerVerification = (): UseSafeSignerVerificationResult => {
  const { address: connectedAddress } = useAccount();
  const { safeConfig } = useUser();
  const publicClient = usePublicClient();

  const [safeSigners, setSafeSigners] = useState<Address[] | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [signerError, setSignerError] = useState<Error | null>(null);

  const getSafeSigners = useCallback(
    async (safeAddress: Address) => {
      setSignerError(null);

      setIsDataLoading(true);

      try {
        const { delay: delayModuleAddress } = predictAddresses(safeAddress);

        const data = await getAccountOwners((data) =>
          publicClient.call({
            to: delayModuleAddress as Address,
            data,
          }),
        );

        setSafeSigners(data);
      } catch (error) {
        console.error("Error getting safe signers", error);
        setSignerError(error as Error);
      } finally {
        setIsDataLoading(false);
      }
    },
    [publicClient],
  );

  useEffect(() => {
    if (safeConfig?.address) {
      getSafeSigners(safeConfig.address as Address);
    }
  }, [safeConfig?.address, getSafeSigners]);

  const isSignerConnected = useMemo(() => {
    if (!safeSigners?.length) return false;
    if (!connectedAddress) return false;
    if (!safeConfig?.address) return false;
    if (isDataLoading) return false;

    return safeSigners.includes(connectedAddress as Address);
  }, [safeSigners, connectedAddress, isDataLoading, safeConfig?.address]);

  return {
    isSignerConnected,
    signerError,
    isDataLoading,
  };
};
