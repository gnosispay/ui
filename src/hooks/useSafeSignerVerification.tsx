import { useState, useCallback, useMemo, useEffect } from "react";
import type { Address } from "viem";
import { getApiV1Owners } from "@/client";
import { useUser } from "@/context/UserContext";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { useAppKitAccount } from "@reown/appkit/react";

interface UseSafeSignerVerificationResult {
  isSignerConnected: boolean;
  signerError: Error | null;
  isDataLoading: boolean;
}

export const useSafeSignerVerification = (): UseSafeSignerVerificationResult => {
  const { address: connectedAddress } = useAppKitAccount();
  const { safeConfig } = useUser();

  const [safeSigners, setSafeSigners] = useState<Address[] | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [signerError, setSignerError] = useState<Error | null>(null);

  const getSafeSigners = useCallback(async () => {
    setSignerError(null);
    setIsDataLoading(true);

    try {
      const { data: apiResponse, error: apiError } = await getApiV1Owners();

      if (apiError) {
        console.error("---> API error:", apiError);
        const message = extractErrorMessage(apiError, "Failed to fetch safe owners");
        setSignerError(new Error(message));
        return;
      }

      if (!apiResponse?.data?.owners || !Array.isArray(apiResponse.data.owners)) {
        const message = "API returned invalid owners data";
        setSignerError(new Error(message));
        return;
      }

      setSafeSigners(apiResponse.data.owners as Address[]);
    } catch (error) {
      console.error("Error getting safe signers", error);
      const message = extractErrorMessage(error, "Failed to fetch safe owners");
      setSignerError(new Error(message));
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!safeConfig) {
      return;
    }

    getSafeSigners();
  }, [safeConfig, getSafeSigners]);

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
