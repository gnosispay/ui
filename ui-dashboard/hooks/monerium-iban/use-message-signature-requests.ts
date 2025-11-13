import { useMemo } from "react";
import { SIGN_MESSAGE_LIB_ADDRESS } from "@/lib/constants";
import useDelayRelay from "../use-delay-relay";

export const useMessageSignatureRequests = (account: string) => {
  const { queue } = useDelayRelay(account);

  const signatures = useMemo(() => {
    return queue.filter((tx) => {
      const { transactionData: rawTransactionData } = tx;
      const { to } = JSON.parse(rawTransactionData);

      return to === SIGN_MESSAGE_LIB_ADDRESS;
    });
  }, [queue]);

  const hasPendingSignatureRequests = useMemo(() => {
    return signatures.some(
      (tx) => tx.status !== "EXECUTED" && tx.status !== "FAILED",
    );
  }, [signatures]);

  return {
    hasPendingSignatureRequests,
  };
};
