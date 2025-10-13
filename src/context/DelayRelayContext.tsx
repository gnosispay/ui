import { type DelayTransaction, getApiV1DelayRelay } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { formatCountdown } from "@/utils/timeUtils";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { getTxTitle } from "@/utils/delayUtils";
import { useUser } from "./UserContext";

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
  const { safeConfig, isOnboarded } = useUser();
  const [queue, setQueue] = useState<DelayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking transactions with active toasts (to avoid dependency cycles)
  const executingTxsRef = useRef<Set<string>>(new Set());
  const countDownTxsRef = useRef<Set<string>>(new Set());
  const processingTxsRef = useRef<Set<string>>(new Set());

  // Refs only for intervals (necessary to avoid stale closures)
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nonExecutedQueue = useMemo(() => {
    return queue.filter((tx) => tx.status !== "EXECUTED");
  }, [queue]);

  const executingQueue = useMemo(() => {
    return queue.filter((tx) => tx.status === "EXECUTING");
  }, [queue]);

  const hasExecutingTransactions = useMemo(() => executingQueue.length > 0, [executingQueue]);

  const countDownQueue = useMemo(() => {
    return nonExecutedQueue.filter((tx) => {
      if (!tx.id || (tx.status !== "WAITING" && tx.status !== "QUEUING") || !tx.readyAt) return false;

      // Only include transactions with readyAt in the future
      const readyDate = new Date(tx.readyAt);
      const now = new Date();
      return readyDate.getTime() > now.getTime();
    });
  }, [nonExecutedQueue]);

  const processingQueue = useMemo(() => {
    return nonExecutedQueue.filter((tx) => {
      if (!tx.id) return false;

      if (tx.status !== "QUEUING" && tx.status !== "WAITING") return false;

      if (!tx.readyAt) return true;

      // Include transactions with readyAt in the past (ready to execute)
      const readyDate = new Date(tx.readyAt);
      const now = new Date();
      return readyDate.getTime() <= now.getTime();
    });
  }, [nonExecutedQueue]);

  const fetchDelayQueue = useCallback(async () => {
    setIsLoading(true);
    getApiV1DelayRelay()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching delay queue", error);
          setError(extractErrorMessage(error, "Failed to fetch delay queue"));
          return;
        }

        setQueue(data || []);
      })
      .catch((error) => {
        console.error("Error fetching delay queue", error);
        setError(extractErrorMessage(error, "Failed to fetch delay queue"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Dynamic fetch interval management
  useEffect(() => {
    if (!isOnboarded) return;

    // Clear existing interval
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }

    // Initial fetch
    fetchDelayQueue();

    // Set interval based on whether we have executing transactions
    // if we have an executing tx: 1s, if we have a waiting tx 5s, otherwise 30s
    const intervalTime = hasExecutingTransactions ? 1000 : nonExecutedQueue.length > 0 ? 5000 : 30000;
    fetchIntervalRef.current = setInterval(fetchDelayQueue, intervalTime);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [isOnboarded, hasExecutingTransactions, nonExecutedQueue.length, fetchDelayQueue]);

  // Executing transactions
  useEffect(() => {
    const prefix = "executing";
    const currentExecutingIds = new Set(executingQueue.map((tx) => tx.id).filter((id): id is string => Boolean(id)));

    // Show toasts for new executing transactions
    for (const tx of executingQueue) {
      if (tx.transactionData && tx.id && !executingTxsRef.current.has(tx.id)) {
        const title = getTxTitle(safeConfig?.address, tx.transactionData);
        toast.loading(title, {
          id: `${prefix}-${tx.id}`,
          description: "Processing on-chain...",
          duration: Number.POSITIVE_INFINITY,
        });
      }
    }

    // Remove toasts for transactions that are no longer executing
    for (const txId of executingTxsRef.current) {
      if (!currentExecutingIds.has(txId)) {
        toast.dismiss(`${prefix}-${txId}`);
        toast.success("Transaction completed!", {
          duration: 1000,
        });
      }
    }

    executingTxsRef.current = currentExecutingIds;
  }, [executingQueue, safeConfig?.address]);

  // Processing transactions (QUEUING/WAITING without readyAt or with past readyAt)
  useEffect(() => {
    const prefix = "processing";
    const currentProcessingIds = new Set(processingQueue.map((tx) => tx.id).filter((id): id is string => Boolean(id)));

    // Show toasts for new processing transactions
    for (const tx of processingQueue) {
      if (tx.id && !processingTxsRef.current.has(tx.id)) {
        const title = getTxTitle(safeConfig?.address, tx.transactionData);
        toast.loading(title, {
          id: `${prefix}-${tx.id}`,
          description: "Processing...",
          duration: Number.POSITIVE_INFINITY,
        });
      }
    }

    // Remove toasts for transactions that are no longer processing
    for (const txId of processingTxsRef.current) {
      if (!currentProcessingIds.has(txId)) {
        toast.dismiss(`${prefix}-${txId}`);
      }
    }

    processingTxsRef.current = currentProcessingIds;
  }, [processingQueue, safeConfig?.address]);

  // Transactions with countdown (future readyAt)
  useEffect(() => {
    const prefix = "countdown";
    const currentCountDownIds = new Set(countDownQueue.map((tx) => tx.id).filter((id): id is string => Boolean(id)));

    for (const tx of countDownQueue) {
      const readyDate = new Date(tx.readyAt || "");
      const diff = readyDate.getTime() - Date.now();

      if (tx.id && !countDownTxsRef.current.has(tx.id)) {
        const title = getTxTitle(safeConfig?.address, tx.transactionData);
        toast.loading(title, {
          id: `${prefix}-${tx.id}`,
          description: `Executing in ${formatCountdown(diff)}`,
          duration: Number.POSITIVE_INFINITY,
        });
      }
    }

    // Remove toasts for transactions that are no longer in the countdown queue
    for (const txId of countDownTxsRef.current) {
      if (!currentCountDownIds.has(txId)) {
        toast.dismiss(`${prefix}-${txId}`);
      }
    }

    countDownTxsRef.current = currentCountDownIds;

    // Clear existing countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Set up interval to update toast descriptions
    countdownIntervalRef.current = setInterval(() => {
      let activeTransactions = false;

      for (const tx of countDownQueue) {
        if (tx.readyAt && tx.id && countDownTxsRef.current.has(tx.id)) {
          const readyDate = new Date(tx.readyAt);
          const diff = readyDate.getTime() - Date.now();
          if (diff > 0) {
            activeTransactions = true;
            // Update toast with fresh countdown
            const title = getTxTitle(safeConfig?.address, tx.transactionData);
            toast.loading(title, {
              id: `${prefix}-${tx.id}`,
              description: `Executing in ${formatCountdown(diff)}`,
            });
          }
        }
      }

      // Clear interval if no active transactions remain
      if (!activeTransactions && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countDownQueue, safeConfig?.address]);

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
