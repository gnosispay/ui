import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import { getAccountKit, type SafeKind } from "@/utils/accountKit";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";

// The Delay module enforces cooldown against the chain's block.timestamp, which
// can lag the browser clock by up to ~1-2 block times (~5-10s on Gnosis Chain).
// This buffer delays showing the Execute button so we don't surface it a moment
// before the chain will accept it, which would cause the transaction to revert.
const EXECUTION_COOLDOWN_BUFFER_SECONDS = 15n;

export interface PendingTransaction {
  nonce: bigint;
  hash: string | null;
  expirationTimestamp: bigint;
  creationTimestamp: bigint;
  // Timestamp (seconds) at which isCooledDown becomes true — includes the
  // execution buffer so the countdown in the UI matches exactly when the
  // Execute button will appear.
  cooldownEndTimestamp: bigint;
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

interface DelayModuleQueueContextValue {
  safeAddress: Address | undefined;
  kind: SafeKind;
  queueInfo: DelayModuleQueueInfo | null;
  queue: PendingTransaction[];
  isError: boolean;
  hasExpiredTransaction: boolean;
  refetch: () => void;
  skipExpired: () => Promise<void>;
  executeTransaction: (to: Address, value: bigint, data: `0x${string}`) => Promise<void>;
}

const DelayModuleQueueContext = createContext<DelayModuleQueueContextValue | undefined>(undefined);

interface DelayModuleQueueContextProviderProps {
  children: ReactNode;
  safeAddress: Address | undefined;
  kind: SafeKind;
  onTransactionExecuted?: () => void;
}

export const DelayModuleQueueContextProvider = ({
  children,
  safeAddress,
  kind,
  onTransactionExecuted,
}: DelayModuleQueueContextProviderProps) => {
  const [queueInfo, setQueueInfo] = useState<DelayModuleQueueInfo | null>(null);
  const [queue, setQueue] = useState<PendingTransaction[]>([]);
  const [isError, setIsError] = useState(false);
  const hasExpiredTransaction = useMemo(() => {
    return queue?.some((transaction) => transaction.isExpired);
  }, [queue]);

  const delayModAddress = useMemo(() => {
    if (!safeAddress) return undefined;

    let delayModAddress: string | undefined;

    try {
      delayModAddress = getAccountKit(kind).predictAddresses(safeAddress).delay;
    } catch (error) {
      console.error("Error getting delay module address:", error);
      return undefined;
    }

    return delayModAddress as Address;
  }, [safeAddress, kind]);

  const fetchQueueInfo = useCallback(async () => {
    if (!delayModAddress) {
      setQueueInfo(null);
      setQueue([]);
      return;
    }

    setIsError(false);

    try {
      // Fetch txNonce, queueNonce, cooldown, and expiration in parallel
      const [txNonce, queueNonce, cooldown, expiration] = await Promise.all([
        readContract(wagmiAdapter.wagmiConfig, {
          address: delayModAddress,
          abi: DELAY_MOD_ABI,
          functionName: "txNonce",
        }) as Promise<bigint>,
        readContract(wagmiAdapter.wagmiConfig, {
          address: delayModAddress,
          abi: DELAY_MOD_ABI,
          functionName: "queueNonce",
        }) as Promise<bigint>,
        readContract(wagmiAdapter.wagmiConfig, {
          address: delayModAddress,
          abi: DELAY_MOD_ABI,
          functionName: "txCooldown",
        }) as Promise<bigint>,
        readContract(wagmiAdapter.wagmiConfig, {
          address: delayModAddress,
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
                address: delayModAddress,
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
                address: delayModAddress,
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
            const cooldownTimestamp = creationTimestamp + cooldown;
            const onChainExpirationTimestamp = cooldownTimestamp + expiration;
            const isExpired = expiration > 0n && currentTimeSeconds > onChainExpirationTimestamp;
            const isCooledDown = currentTimeSeconds > cooldownTimestamp + EXECUTION_COOLDOWN_BUFFER_SECONDS;

            pendingQueue.push({
              nonce,
              hash,
              expirationTimestamp: onChainExpirationTimestamp,
              cooldownEndTimestamp: cooldownTimestamp + EXECUTION_COOLDOWN_BUFFER_SECONDS,
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
      const message = error instanceof Error ? error.message : String(error);
      // If the delay module contract isn't deployed at the predicted address yet,
      // treat it as an empty queue rather than a hard error so the UI doesn't
      // enter a persistent error state while the account is being set up.
      const isContractNotDeployed =
        message.toLowerCase().includes("returned no data") ||
        message.toLowerCase().includes("zero data") ||
        message.toLowerCase().includes("no data returned");
      if (isContractNotDeployed) {
        setQueue([]);
        setQueueInfo(null);
      } else {
        setIsError(true);
      }
    }
  }, [delayModAddress]);

  useEffect(() => {
    // Initial fetch
    fetchQueueInfo();

    // Poll every 5 seconds to keep the UI dynamic
    const interval = setInterval(() => {
      fetchQueueInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchQueueInfo]);

  const refetch = useCallback(() => {
    fetchQueueInfo();
  }, [fetchQueueInfo]);

  const skipExpired = useCallback(async () => {
    if (!delayModAddress || !hasExpiredTransaction) {
      return;
    }

    try {
      // Call skipExpired on the delay module
      const txHash = await writeContract(wagmiAdapter.wagmiConfig, {
        address: delayModAddress,
        abi: DELAY_MOD_ABI,
        functionName: "skipExpired",
      });

      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
        hash: txHash,
      });

      toast.success("Expired transactions skipped successfully!");
      console.info("Skip expired transaction hash:", txHash);

      // Refresh queue
      refetch();
      onTransactionExecuted?.();
    } catch (error) {
      console.error("Error skipping expired transactions:", error);
      toast.error(extractErrorMessage(error, "Error skipping expired transactions"));
      throw error; // Re-throw so component can handle loading state
    }
  }, [delayModAddress, hasExpiredTransaction, refetch, onTransactionExecuted]);

  const executeTransaction = useCallback(
    async (to: Address, value: bigint, data: `0x${string}`) => {
      if (!delayModAddress) {
        throw new Error("Safe address not available");
      }

      try {
        // Call executeNextTx on the delay module with transaction parameters
        const txHash = await writeContract(wagmiAdapter.wagmiConfig, {
          address: delayModAddress,
          abi: DELAY_MOD_ABI,
          functionName: "executeNextTx",
          args: [to, value, data, getAccountKit(kind).OperationType.Call],
        });

        // Wait for transaction confirmation
        await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
          hash: txHash,
        });

        toast.success("Transaction executed successfully!");
        console.info("Execute transaction hash:", txHash);

        // Refresh queue
        refetch();
        onTransactionExecuted?.();
      } catch (error) {
        console.error("Error executing transaction:", error);
        toast.error(extractErrorMessage(error, "Error executing transaction"));
        throw error; // Re-throw so component can handle loading state
      }
    },
    [delayModAddress, kind, refetch, onTransactionExecuted],
  );

  const value: DelayModuleQueueContextValue = {
    safeAddress,
    kind,
    queueInfo,
    queue,
    isError,
    hasExpiredTransaction,
    refetch,
    skipExpired,
    executeTransaction,
  };

  return <DelayModuleQueueContext.Provider value={value}>{children}</DelayModuleQueueContext.Provider>;
};

export const useDelayModuleQueue = (): DelayModuleQueueContextValue => {
  const context = useContext(DelayModuleQueueContext);
  if (context === undefined) {
    throw new Error("useDelayModuleQueueContext must be used within a DelayModuleQueueContextProvider");
  }
  return context;
};
