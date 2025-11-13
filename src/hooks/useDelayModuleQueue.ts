import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { readContract } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import { predictAddresses } from "@gnosispay/account-kit";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";

export interface DelayModuleQueueInfo {
  hasPendingTransactions: boolean;
  txNonce: bigint;
  queueNonce: bigint;
  pendingCount: number;
  cooldown: bigint;
  expiration: bigint;
  txCreatedAt: bigint | null;
  hasExpiredTransactions: boolean;
}

export interface UseDelayModuleQueueResult {
  queueInfo: DelayModuleQueueInfo | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const useDelayModuleQueue = (): UseDelayModuleQueueResult => {
  const { safeConfig } = useUser();
  const [queueInfo, setQueueInfo] = useState<DelayModuleQueueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchQueueInfo = useCallback(
    async (isPolling = false) => {
      if (!safeConfig?.address) {
        setQueueInfo(null);
        return;
      }

      // Only show loading state on initial load, not during polling
      if (!isPolling) {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        // Get the delay module address using account-kit
        const { delay: delayModAddress } = predictAddresses(safeConfig.address);

        // Fetch txNonce, queueNonce, cooldown, and expiration in parallel
        const [txNonce, queueNonce, cooldown, expiration] = await Promise.all([
          readContract(wagmiAdapter.wagmiConfig, {
            address: delayModAddress as Address,
            abi: DELAY_MOD_ABI,
            functionName: "txNonce",
          }) as Promise<bigint>,
          readContract(wagmiAdapter.wagmiConfig, {
            address: delayModAddress as Address,
            abi: DELAY_MOD_ABI,
            functionName: "queueNonce",
          }) as Promise<bigint>,
          readContract(wagmiAdapter.wagmiConfig, {
            address: delayModAddress as Address,
            abi: DELAY_MOD_ABI,
            functionName: "txCooldown",
          }) as Promise<bigint>,
          readContract(wagmiAdapter.wagmiConfig, {
            address: delayModAddress as Address,
            abi: DELAY_MOD_ABI,
            functionName: "txExpiration",
          }) as Promise<bigint>,
        ]);

        const hasPendingTransactions = txNonce !== queueNonce;
        const pendingCount = Number(queueNonce - txNonce);

        // Fetch the creation timestamp of the next transaction to execute (if any)
        let txCreatedAt: bigint | null = null;
        let hasExpiredTransactions = false;

        if (hasPendingTransactions) {
          try {
            txCreatedAt = (await readContract(wagmiAdapter.wagmiConfig, {
              address: delayModAddress as Address,
              abi: DELAY_MOD_ABI,
              functionName: "getTxCreatedAt",
              args: [txNonce],
            })) as bigint;

            // Check if the transaction has expired
            // Transaction is expired if: current time > (txCreatedAt + expiration)
            if (txCreatedAt && expiration > 0n) {
              const currentTimeSeconds = BigInt(Math.floor(Date.now() / 1000));
              const expirationTime = txCreatedAt + expiration;
              hasExpiredTransactions = currentTimeSeconds > expirationTime;
            }
          } catch (error) {
            console.error("Error fetching txCreatedAt:", error);
            // Continue without timestamp - will fall back to localStorage
          }
        }

        setQueueInfo({
          hasPendingTransactions,
          txNonce,
          queueNonce,
          pendingCount,
          cooldown,
          expiration,
          txCreatedAt,
          hasExpiredTransactions,
        });
      } catch (error) {
        console.error("Error fetching delay module queue info:", error);
        // Only set error state on initial load, not during polling
        if (!isPolling) {
          setIsError(true);
          setQueueInfo(null);
        }
      } finally {
        if (!isPolling) {
          setIsLoading(false);
        }
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    },
    [safeConfig?.address, isInitialLoad],
  );

  useEffect(() => {
    // Initial fetch
    fetchQueueInfo(false);

    // Poll every 5 seconds to keep the UI dynamic
    const interval = setInterval(() => {
      fetchQueueInfo(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchQueueInfo]);

  const refetch = useCallback(() => {
    fetchQueueInfo(true);
  }, [fetchQueueInfo]);

  return {
    queueInfo,
    isLoading,
    isError,
    refetch,
  };
};
