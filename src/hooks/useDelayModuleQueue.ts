import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { readContract } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import { predictAddresses } from "@gnosispay/account-kit";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";

export interface PendingTransaction {
  nonce: bigint;
  hash: string | null;
  expirationTimestamp: bigint;
  creationTimestamp: bigint;
  isExpired: boolean;
  isCooledDown: boolean;
}

export interface DelayModuleQueueInfo {
  hasPendingTransactions: boolean;
  txNonce: bigint;
  queueNonce: bigint;
  cooldown: bigint;
  expiration: bigint;
}

export interface UseDelayModuleQueueResult {
  queueInfo: DelayModuleQueueInfo | null;
  queue: PendingTransaction[];
  isError: boolean;
  refetch: () => void;
}

export const useDelayModuleQueue = (): UseDelayModuleQueueResult => {
  const { safeConfig } = useUser();
  const [queueInfo, setQueueInfo] = useState<DelayModuleQueueInfo | null>(null);
  const [queue, setQueue] = useState<PendingTransaction[]>([]);
  const [isError, setIsError] = useState(false);

  const fetchQueueInfo = useCallback(
    async (isPolling = false) => {
      if (!safeConfig?.address) {
        setQueueInfo(null);
        setQueue([]);
        return;
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

        // Build queue of all pending transactions
        const pendingQueue: PendingTransaction[] = [];
        const currentTimeSeconds = BigInt(Math.floor(Date.now() / 1000));

        if (hasPendingTransactions && queueNonce > txNonce) {
          // Fetch creation timestamps and hashes for all pending transactions (from txNonce to queueNonce - 1)
          const txDataPromises: Promise<{ nonce: bigint; createdAt: bigint | null; hash: string | null }>[] = [];
          const nonces: bigint[] = [];

          // Convert to numbers for loop iteration
          const txNonceNum = Number(txNonce);
          const queueNonceNum = Number(queueNonce);

          for (let i = txNonceNum; i < queueNonceNum; i++) {
            const nonce = BigInt(i);
            nonces.push(nonce);

            // Fetch both createdAt and hash in parallel for each nonce
            txDataPromises.push(
              Promise.all([
                readContract(wagmiAdapter.wagmiConfig, {
                  address: delayModAddress as Address,
                  abi: DELAY_MOD_ABI,
                  functionName: "getTxCreatedAt",
                  args: [nonce],
                })
                  .then((result) => result as bigint)
                  .catch((error) => {
                    console.error(`Error fetching txCreatedAt for nonce ${nonce}:`, error);
                    return null;
                  }),
                readContract(wagmiAdapter.wagmiConfig, {
                  address: delayModAddress as Address,
                  abi: DELAY_MOD_ABI,
                  functionName: "getTxHash",
                  args: [nonce],
                })
                  .then((result) => {
                    // Convert bytes32 to hex string (0x prefixed)
                    const hash = result as `0x${string}`;
                    return hash;
                  })
                  .catch((error) => {
                    console.error(`Error fetching txHash for nonce ${nonce}:`, error);
                    return null;
                  }),
              ]).then(([createdAt, hash]) => ({
                nonce,
                createdAt,
                hash,
              })),
            );
          }

          const txDataArray = await Promise.all(txDataPromises);

          // Build queue items with all required information
          for (let i = 0; i < txDataArray.length; i++) {
            const { nonce, createdAt: creationTimestamp, hash } = txDataArray[i];

            if (creationTimestamp !== null) {
              const expirationTimestamp = creationTimestamp + expiration;
              const cooldownTimestamp = creationTimestamp + cooldown;
              const isExpired = expiration > 0n && currentTimeSeconds > expirationTimestamp;
              const isCooledDown = currentTimeSeconds > cooldownTimestamp;

              pendingQueue.push({
                nonce,
                hash,
                expirationTimestamp,
                creationTimestamp,
                isExpired,
                isCooledDown,
              });
            }
          }
        }

        setQueue(pendingQueue);

        setQueueInfo({
          hasPendingTransactions,
          txNonce,
          queueNonce,
          cooldown,
          expiration,
        });
      } catch (error) {
        console.error("Error fetching delay module queue info:", error);
        // Only set error state on initial load, not during polling
        if (!isPolling) {
          setIsError(true);
          setQueueInfo(null);
          setQueue([]);
        }
      }
    },
    [safeConfig?.address],
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
    queue,
    isError,
    refetch,
  };
};
