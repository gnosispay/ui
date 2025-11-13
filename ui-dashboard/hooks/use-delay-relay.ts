"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { populateExecuteEnqueue } from "@gnosispay/account-kit";
import api from "@/lib/api";
import getDelayTransactions from "@/lib/get-delay-transactions";
import useSign from "./use-sign";
import type { DelayTransaction } from "@/lib/get-delay-transactions";
import type { TransactionRequest } from "@gnosispay/account-kit";

const delayQueueQueryKey = (account: string) => ["delayQueueQuery", account];

let websocket: Promise<WebSocket> | undefined = undefined;
const subscriptions = new Set<string>();

const useDelayRelay = (account: string) => {
  const delayQueueQuery = useQuery({
    queryKey: delayQueueQueryKey(account),
    queryFn: async () => {
      return await getDelayTransactions();
    },
  });

  const queue = delayQueueQuery.data || [];

  const sign = useSign();

  const queryClient = useQueryClient();
  const delayRelay = async (transaction: TransactionRequest) => {
    if (queueHasUpdatesPending(queue)) {
      toast.error(
        "Please wait for pending transactions in delay queue to complete",
      );
      throw new Error(
        "New transactions cannot be appended to the delay queue while there are pending transactions.",
      );
    }

    try {
      const enqueueTx = await populateExecuteEnqueue(
        { account, chainId: 100 },
        transaction,
        sign,
      );

      const operationType =
        transaction.operationType === 1 ? "DELEGATECALL" : "CALL";

      const response = await api().post("/delay-relay", {
        chainId: 100,
        target: enqueueTx.to,
        signedData: enqueueTx.data,
        safeAddress: account,
        operationType,
        transactionData: {
          to: transaction.to,
          value: transaction.value.toString(),
          data: transaction.data,
        },
      });

      // response is the delayTransaction entity from our API
      return (await response.json()) as DelayTransaction;
    } catch (e: any) {
      // if the user aborted the transaction, don't show or log an error
      const isUserRejection =
        e instanceof Error && "code" in e && e.code === 4001;

      if (!isUserRejection) {
        toast.error("Failed to relay transaction");
        throw e;
      } else {
        console.log("User rejected transaction", e);
        throw e;
      }
    }
  };

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: delayRelay,
    onSuccess: (delayTransaction) => {
      // push to queue
      if (delayTransaction) {
        queryClient.setQueryData(delayQueueQueryKey(account), (old: any) => [
          ...old,
          delayTransaction,
        ]);
      }
    },
  });

  // establish websocket connection
  useEffect(() => {
    // another instance of the hook already established the connection
    if (websocket) {return;}

    websocket = new Promise((resolve) => {
      const ws = new WebSocket(wssUrl("delay-relay-ws"));
      ws.onopen = () => {
        ws.onmessage = (event) => {
          try {
            const { transactionId, ...updatedFields } = JSON.parse(event.data);
            if (typeof transactionId !== "string") {
              throw new Error("Invalid transactionId");
            }

            // apply field updates to cache
            queryClient.setQueryData(delayQueueQueryKey(account), (old: any) =>
              old.map((tx: DelayTransaction) =>
                tx.id === transactionId ? { ...tx, ...updatedFields } : tx,
              ),
            );
          } catch (e) {
            console.error("Invalid ws message", event, e);
          }
        };

        window.addEventListener("beforeunload", () => {
          ws.close();
        });

        resolve(ws);
      };
    });
  }, [account, queryClient]);

  const subscribe = async (transactionId: string) => {
    const ws = await websocket;
    if (!ws) {
      throw new Error("No websocket connection");
    }
    if (!subscriptions.has(transactionId)) {
      ws.send(JSON.stringify({ subscribe: transactionId }));
      subscriptions.add(transactionId);
      console.log(
        "delay-relay: subscribe to transaction status",
        transactionId,
      );
    }
  };

  useEffect(() => {
    if (!Array.isArray(queue)) {return;}

    // subscribe to status updates for new transactions via websocket
    for (const transaction of queue) {
      if (
        hasUpdatesPending(transaction) &&
        !subscriptions.has(transaction.id)
      ) {
        subscribe(transaction.id);
      }
    }
  }, [queue]);

  return {
    isLoading: delayQueueQuery.isLoading,
    queue: delayQueueQuery.data || [],
    delayRelay: mutateAsync,
    ...rest,
  };
};

export default useDelayRelay;

const wssUrl = (path: string) => {
  if (!process.env.NEXT_PUBLIC_GNOSIS_PAY_API_URL)
    {throw new Error("Missing NEXT_PUBLIC_GNOSIS_PAY_API_URL env var");}
  const url = new URL(
    process.env.NEXT_PUBLIC_GNOSIS_PAY_API_URL + "/api/v1/" + path,
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
};

const hasUpdatesPending = (transaction: DelayTransaction) =>
  transaction.status !== "EXECUTED" && transaction.status !== "FAILED";

const queueHasUpdatesPending = (queue: DelayTransaction[]) =>
  queue.some(hasUpdatesPending);
