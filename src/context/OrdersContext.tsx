import { getApiV1Order, type CardOrder } from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { useAuth } from "./AuthContext";

type OrdersContextProps = {
  children: ReactNode | ReactNode[];
};

export type IOrdersContext = {
  orders: CardOrder[];
  pendingPhysicalOrders: CardOrder[];
  isLoading: boolean;
  refetch: () => void;
};

const OrdersContext = createContext<IOrdersContext | undefined>(undefined);

const OrdersContextProvider = ({ children }: OrdersContextProps) => {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchOrders = useCallback(() => {
    setIsLoading(true);

    getApiV1Order()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching card orders:", error);
          toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
          return;
        }

        setOrders(data as CardOrder[]);
      })
      .catch((error) => {
        console.error("Error fetching card orders:", error);
        toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
  }, [fetchOrders, isAuthenticated]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        pendingPhysicalOrders,
        isLoading,
        refetch: fetchOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders() must be used within an OrdersContextProvider");
  }
  return context;
};

export { OrdersContextProvider, useOrders };
