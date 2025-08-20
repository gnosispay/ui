import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiV1Order, type CardOrder } from "@/client";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";

export interface UsePendingCardOrdersResult {
  orders: CardOrder[];
  pendingPhysicalOrders: CardOrder[];
  isLoading: boolean;
  refetch: () => void;
}

export const usePendingCardOrders = (): UsePendingCardOrdersResult => {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(() => {
    setIsLoading(true);

    getApiV1Order()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching card orders:", error);
          toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
          return;
        }

        // Type assertion to handle the null vs undefined difference
        setOrders((data || []) as CardOrder[]);
      })
      .catch((error) => {
        console.error("Error fetching card orders:", error);
        toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const pendingPhysicalOrders = useMemo(() => {
    return orders
      .filter((order) => !order.virtual)
      .filter(
        (order) =>
          order.status === "PENDINGTRANSACTION" ||
          order.status === "TRANSACTIONCOMPLETE" ||
          order.status === "CONFIRMATIONREQUIRED" ||
          order.status === "READY",
      );
  }, [orders]);

  return {
    orders,
    pendingPhysicalOrders,
    isLoading,
    refetch: fetchOrders,
  };
};
