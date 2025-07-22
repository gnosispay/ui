import { type DelayTransaction, getApiV1DelayRelay } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { formatDistanceToNowStrict } from "date-fns";
import { type ReactNode, createContext, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type DelayRelayContextProps = {
  children: ReactNode | ReactNode[];
};

export type IDelayRelayContext = {
  queue: DelayTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchDelayQueue: () => Promise<void>;
};

const DelayRelayContext = createContext<IDelayRelayContext | undefined>(undefined);

const DelayRelayContextProvider = ({ children }: DelayRelayContextProps) => {
  const { isAuthenticated } = useAuth();
  const [queue, setQueue] = useState<DelayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nonExecutedQueue = useMemo(() => {
    return queue.filter((tx) => tx.status !== "EXECUTED");
  }, [queue]);
  const [txWithCounter, setTxWithCounter] = useState<Set<string>>(() => new Set());

  console.log("queue", queue);
  console.log("txWithCounter", txWithCounter);
  console.log("nonExecutedQueue", nonExecutedQueue);
  useEffect(() => {
    if (txWithCounter.size === 0) return;

    const interval = setInterval(() => {
      let activeTransactions = false;

      for (const tx of nonExecutedQueue) {
        if (tx.readyAt && txWithCounter.has(tx.id || "")) {
          const readyDate = new Date(tx.readyAt);
          if (readyDate > new Date()) {
            activeTransactions = true;
            toast.loading(`Transaction ${tx.id} is in the delay queue`, {
              id: tx.id,
              description: `Executing in ${formatDistanceToNowStrict(readyDate)}`,
            });
          } else {
            toast.dismiss(tx.id);
            setTxWithCounter((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tx.id || "");
              return newSet;
            });
          }
        }
      }

      // If no active transactions are left, clear the interval
      if (!activeTransactions) {
        clearInterval(interval);
        setTxWithCounter(new Set());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nonExecutedQueue, txWithCounter]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchDelayQueue();

    const interval = setInterval(fetchDelayQueue, 30000); // Fetch every 10 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchDelayQueue = useCallback(async () => {
    setIsLoading(true);
    getApiV1DelayRelay()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching delay queue", error);
          setError(extractErrorMessage(error, "Failed to fetch delay queue"));
          return;
        }

        setQueue([
          {
            id: "cmd91g24o0000wh340s5zs4x0",
            safeAddress: "0xD637C95af1333170DCf661e5548319788AAbd188",
            transactionData:
              '{"to":"0xcB444e90D8198415266c6a2724b7900fb12FC56E","value":"0","data":"0xa9059cbb000000000000000000000000f85e52d8d9827d94a6109f67948bea6883083d9300000000000000000000000000000000000000000000000000071afd498d0000"}',
            enqueueTaskId: "0xe9cc42c1872e0776f42a3cc7f98ae54be244f304310fee7a06065f82e2fedbf7",
            dispatchTaskId: null,
            readyAt: "2025-07-22T19:02:58.330Z",
            operationType: "CALL",
            userId: "cmcv0h9730000avs6l7le0jtu",
            status: "QUEUING",
            createdAt: "2025-07-22T19:54:58.330Z",
          },
        ]);
      })
      .catch((error) => {
        console.error("Error fetching delay queue", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!nonExecutedQueue.length) return;

    const inQueue = nonExecutedQueue.filter((tx) => tx.status === "WAITING" || tx.status === "QUEUING");

    console.log("inQueue", inQueue);
    for (const tx of inQueue) {
      console.log(
        'tx.status !== "EXECUTING" && tx.readyAt && tx.id && !txWithCounter.has(tx.id)',
        tx.status !== "EXECUTING",
        tx.readyAt,
        tx.id,
        txWithCounter,
      );
      if (tx.status !== "EXECUTING" && tx.readyAt && tx.id && !txWithCounter.has(tx.id)) {
        toast.loading(`Transaction ${tx.id} is in the delay queue`, {
          id: tx.id,
          description: `Executing in ${formatDistanceToNowStrict(new Date(tx.readyAt))}`,
        });

        if (!tx.id) return;

        const newSet = new Set(txWithCounter);
        newSet.add(tx.id);
        setTxWithCounter(newSet);
      }
    }
  }, [nonExecutedQueue, txWithCounter]);

  return (
    <DelayRelayContext.Provider value={{ queue: nonExecutedQueue, isLoading, error, fetchDelayQueue }}>
      {children}
    </DelayRelayContext.Provider>
  );
};

const useDelayRelay = () => {
  const context = useContext(DelayRelayContext);
  if (context === undefined) {
    throw new Error("useDelayRelay must be used within a DelayRelayContextProvider");
  }
  return context;
};

export { DelayRelayContextProvider, useDelayRelay };
