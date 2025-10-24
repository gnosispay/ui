import { useEffect, useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";

interface UseSmartWalletReturn {
  smartWalletAddress: Address | undefined;
  isSmartWallet: boolean;
  isLoading: boolean;
}

export const useSmartWallet = (): UseSmartWalletReturn => {
  const [isSmartWallet, setIsSmartWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAppKitAccount();
  const publicClient = usePublicClient();

  const checkSmartWallet = useCallback(() => {
    if (!publicClient || !address) {
      setIsSmartWallet(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    publicClient
      .getCode({ address: address as Address })
      .then((bytecode) => {
        // if the bytecode is not empty, it's a smart wallet
        const isContract = !!bytecode;
        setIsSmartWallet(isContract);
      })
      .catch((error) => {
        console.error("Error getting bytecode", error);
        setIsSmartWallet(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [publicClient, address]);

  useEffect(() => {
    checkSmartWallet();
  }, [checkSmartWallet]);

  return {
    smartWalletAddress: isSmartWallet ? (address as Address) : undefined,
    isSmartWallet,
    isLoading,
  };
};
