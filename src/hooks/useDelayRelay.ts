import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { populateExecuteEnqueue } from "@gnosispay/account-kit";
import { useSignTypedData } from "wagmi";
import { getApiV1DelayRelay, postApiV1DelayRelay } from "@/client";
import type { DelayTransaction } from "@/client";
import { gnosis } from "viem/chains";
import { extractErrorMessage } from "@/utils/errorHelpers";

interface TransactionRequest {
  to: string;
  data: string;
  value: bigint | number;
  operationType?: 0 | 1; // 0 for CALL, 1 for DELEGATECALL
}

// const delayQueueQueryKey = (account: string) => ["delayQueueQuery", account];

// let websocket: Promise<WebSocket> | undefined = undefined;
// const subscriptions = new Set<string>();

export const useDelayRelay = (safeAddress: string) => {
  const { signTypedDataAsync } = useSignTypedData();
  const [queue, setQueue] = useState<DelayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApiV1DelayRelay()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching delay queue", error);
          return;
        }

        setQueue(data || []);
      })
      .catch((error) => {
        console.error("Error fetching delay queue", error);
      });
  }, []);

  const sign = useCallback(
    async ({
      domain,
      types,
      primaryType,
      message,
    }: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => {
      return await signTypedDataAsync({
        domain,
        types,
        primaryType,
        message,
      });
    },
    [signTypedDataAsync]
  );

  const delayRelay = async (transaction: TransactionRequest) => {
    // if (queueHasUpdatesPending(queue)) {
    //   toast.error(
    //     "Please wait for pending transactions in delay queue to complete"
    //   );
    //   throw new Error(
    //     "New transactions cannot be appended to the delay queue while there are pending transactions."
    //   );
    // }

    setIsLoading(true);

    try {
      const enqueueTx = await populateExecuteEnqueue(
        { account: safeAddress, chainId: gnosis.id },
        {
          to: transaction.to,
          data: transaction.data,
          value: BigInt(transaction.value),
          operationType: transaction.operationType || 0,
        },
        sign
      );

      const operationType =
        transaction.operationType === 1 ? "DELEGATECALL" : "CALL";

      const { data, error } = await postApiV1DelayRelay({
        body: {
          chainId: 100,
          target: enqueueTx.to,
          signedData: enqueueTx.data,
          safeAddress,
          operationType,
          transactionData: {
            to: transaction.to,
            value: transaction.value.toString(),
            data: transaction.data,
          },
        },
      });

      if (error) {
        console.error("Error posting delay relay", error);
        setError(extractErrorMessage(error, "Failed to relay transaction"));
      }

      return data;
    } catch (e: unknown) {
      // if the user aborted the transaction, don't show or log an error
      const isUserRejection =
        e instanceof Error &&
        "code" in e &&
        (e as { code: number }).code === 4001;

      if (!isUserRejection) {
        setError("Failed to relay transaction");
        console.error("Error relaying transaction", e);
      }

      console.log("User rejected transaction", e);
      setError("User rejected transaction");
    } finally {
      setIsLoading(false);
    }
  };

  //   const { mutateAsync, ...rest } = useMutation({
  //     mutationFn: delayRelay,
  //     onSuccess: (delayTransaction) => {
  //       // push to queue
  //       if (delayTransaction) {
  //         queryClient.setQueryData(
  //           delayQueueQueryKey(safeAddress),
  //           (old: DelayTransaction[] = []) => [...old, delayTransaction]
  //         );
  //       }
  //     },
  //   });

  //   // establish websocket connection for real-time updates
  //   useEffect(() => {
  //     // another instance of the hook already established the connection
  //     if (websocket) {
  //       return;
  //     }

  //     websocket = new Promise((resolve) => {
  //       const ws = new WebSocket(wssUrl("delay-relay-ws"));
  //       ws.onopen = () => {
  //         ws.onmessage = (event) => {
  //           try {
  //             const { transactionId, ...updatedFields } = JSON.parse(event.data);
  //             if (typeof transactionId !== "string") {
  //               throw new Error("Invalid transactionId");
  //             }

  //             // apply field updates to cache
  //             queryClient.setQueryData(
  //               delayQueueQueryKey(safeAddress),
  //               (old: DelayTransaction[] = []) =>
  //                 old.map((tx: DelayTransaction) =>
  //                   tx.id === transactionId ? { ...tx, ...updatedFields } : tx
  //                 )
  //             );
  //           } catch (e) {
  //             console.error("Invalid ws message", event, e);
  //           }
  //         };

  //         window.addEventListener("beforeunload", () => {
  //           ws.close();
  //         });

  //         resolve(ws);
  //       };
  //     });
  //   }, [safeAddress, queryClient]);

  //   const subscribe = useCallback(async (transactionId: string) => {
  //     const ws = await websocket;
  //     if (!ws) {
  //       throw new Error("No websocket connection");
  //     }
  //     if (!subscriptions.has(transactionId)) {
  //       ws.send(JSON.stringify({ subscribe: transactionId }));
  //       subscriptions.add(transactionId);
  //       console.log(
  //         "delay-relay: subscribe to transaction status",
  //         transactionId
  //       );
  //     }
  //   }, []);

  //   useEffect(() => {
  //     if (!Array.isArray(queue)) {
  //       return;
  //     }

  //     // subscribe to status updates for new transactions via websocket
  //     for (const transaction of queue) {
  //       if (
  //         hasUpdatesPending(transaction) &&
  //         transaction.id &&
  //         !subscriptions.has(transaction.id)
  //       ) {
  //         subscribe(transaction.id);
  //       }
  //     }
  //   }, [queue, subscribe]);

  return {
    isLoading,
    error,
    queue,
    delayRelay,
  };
};

// const wssUrl = (path: string) => {
//   // This would need to be configured based on your API URL
//   const apiUrl =
//     import.meta.env.VITE_GNOSIS_PAY_API_BASE_URL || "https://api.gnosispay.com";
//   const url = new URL(`${apiUrl}/api/v1/${path}`);
//   url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
//   return url.toString();
// };

// const hasUpdatesPending = (transaction: DelayTransaction) =>
//   transaction.status !== "EXECUTED" && transaction.status !== "FAILED";

// const queueHasUpdatesPending = (queue: DelayTransaction[]) =>
//   queue.some(hasUpdatesPending);
