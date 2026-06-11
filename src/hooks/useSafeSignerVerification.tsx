import { useState, useCallback, useMemo, useEffect } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { call } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import { getAccountKit, type SafeKind } from "@/utils/accountKit";
import { extractErrorMessage } from "@/utils/errorHelpers";

interface UseSafeSignerVerificationResult {
  isSignerConnected: boolean;
  signerError: Error | null;
  isDataLoading: boolean;
}

export const useSafeSignerVerification = (
  safeAddress: Address | undefined,
  kind: SafeKind = "next",
): UseSafeSignerVerificationResult => {
  const { address: connectedAddress } = useAccount();

  const [safeSigners, setSafeSigners] = useState<Address[] | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [signerError, setSignerError] = useState<Error | null>(null);

  const getSafeSigners = useCallback(
    async (address: Address) => {
      setSignerError(null);
      setIsDataLoading(true);

      try {
        const accountKit = getAccountKit(kind);
        // Gnosis Pay account owners are the EOAs enabled as modules on the
        // account's Delay Mod, not the Safe's own owners. account-kit reads them
        // by paginating the Delay Mod's enabled modules.
        const delayModAddress = accountKit.predictAddresses(address).delay as Address;

        const owners = await accountKit.getAccountOwners(async (data) => {
          const { data: result } = await call(wagmiAdapter.wagmiConfig, {
            to: delayModAddress,
            data,
          });
          return { data: result };
        });

        setSafeSigners(owners as Address[]);
      } catch (error) {
        console.error("Error getting safe signers", error);
        const message = extractErrorMessage(error, "Failed to fetch safe owners");
        // "No data returned" means the delay module isn't deployed at the predicted
        // address yet. Treat this as an unrecoverable loading state rather than
        // surfacing a raw contract error to the user.
        const isContractNotDeployed =
          message.toLowerCase().includes("no data returned") ||
          message.toLowerCase().includes("zero data") ||
          message.toLowerCase().includes("returned no data");
        if (isContractNotDeployed) {
          setSafeSigners([]);
        } else {
          setSignerError(new Error(message));
        }
      } finally {
        setIsDataLoading(false);
      }
    },
    [kind],
  );

  useEffect(() => {
    if (!safeAddress) {
      return;
    }

    getSafeSigners(safeAddress);
  }, [safeAddress, getSafeSigners]);

  const isSignerConnected = useMemo(() => {
    if (!safeSigners?.length) return false;
    if (!connectedAddress) return false;
    if (!safeAddress) return false;
    if (isDataLoading) return false;

    const lowerCaseConnectedAddress = connectedAddress.toLowerCase();
    const lowerCaseSafeSigners = safeSigners.map((signer) => signer.toLowerCase());

    return lowerCaseSafeSigners.includes(lowerCaseConnectedAddress);
  }, [safeSigners, connectedAddress, isDataLoading, safeAddress]);

  return {
    isSignerConnected,
    signerError,
    isDataLoading,
  };
};
