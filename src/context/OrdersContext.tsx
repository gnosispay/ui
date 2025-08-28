import {
  getApiV1Order,
  postApiV1OrderByOrderIdAttachCoupon,
  postApiV1OrderByOrderIdCancel,
  type CardOrder,
} from "@/client";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { useAuth } from "./AuthContext";
import { COUPON_CODES } from "@/constants";
import { extractErrorMessage } from "@/utils/errorHelpers";

type OrdersContextProps = {
  children: ReactNode | ReactNode[];
};

export type IOrdersContext = {
  orders: CardOrder[];
  pendingPhysicalOrders: CardOrder[];
  isLoading: boolean;
  refetch: () => void;
  applyCoupon: (orderId: string) => Promise<void>;
  cancelOrderWithConfirmation: (params: { orderId: string; onSuccess?: () => void }) => void;
};

const OrdersContext = createContext<IOrdersContext | undefined>(undefined);

const OrdersContextProvider = ({ children }: OrdersContextProps) => {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState<string | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [onCancelSuccess, setOnCancelSuccess] = useState<(() => void) | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchOrders = useCallback(() => {
    setIsLoading(true);

    getApiV1Order()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching card orders:", error);
          const message = extractErrorMessage(error, "Failed to fetch card orders");
          toast.error(<CollapsedError title="Failed to fetch card orders" error={message} />);
          return;
        }

        setOrders(data as CardOrder[]);
      })
      .catch((error) => {
        console.error("Error fetching card orders:", error);
        const message = extractErrorMessage(error, "Failed to fetch card orders");
        toast.error(<CollapsedError title="Failed to fetch card orders" error={message} />);
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

  const applyCoupon = useCallback(
    async (orderId: string) => {
      const { data, error } = await postApiV1OrderByOrderIdAttachCoupon({
        path: { orderId },
        body: { couponCode: COUPON_CODES },
      });

      if (error) {
        console.error("Error applying coupon:", error);
        const message = extractErrorMessage(error, "Failed to apply coupon");
        toast.error(<CollapsedError title="Failed to apply coupon" error={message} />);
        throw error;
      }

      if (data) {
        // Refresh order data to get updated totals
        await fetchOrders();
      }
    },
    [fetchOrders],
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      const { error } = await postApiV1OrderByOrderIdCancel({
        path: { orderId },
      });

      if (error) {
        console.error("Error cancelling order:", error);
        const message = extractErrorMessage(error, "Failed to cancel order");
        toast.error(<CollapsedError title="Failed to cancel order" error={message} />);
        throw error;
      }

      toast.success("Card order cancelled successfully");
      fetchOrders();
    },
    [fetchOrders],
  );

  const cancelOrderWithConfirmation = useCallback(
    ({ orderId, onSuccess }: { orderId: string; onSuccess?: () => void }) => {
      setPendingCancelOrderId(orderId);
      setOnCancelSuccess(() => onSuccess || null);
      setShowCancelConfirmation(true);
    },
    [],
  );

  const handleConfirmCancel = useCallback(async () => {
    if (!pendingCancelOrderId) return;

    try {
      setIsCancellingOrder(true);
      await cancelOrder(pendingCancelOrderId);

      // Call the success callback if provided
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    } catch {
      // Error handling is already done in cancelOrder
    } finally {
      setIsCancellingOrder(false);
      setShowCancelConfirmation(false);
      setPendingCancelOrderId(null);
      setOnCancelSuccess(null);
    }
  }, [pendingCancelOrderId, cancelOrder, onCancelSuccess]);

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
        applyCoupon,
        cancelOrderWithConfirmation,
      }}
    >
      {children}
      <ConfirmationDialog
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        title="Cancel Card Order"
        iconColor="text-destructive"
        message="Are you sure you want to cancel this card order? This action cannot be undone and any payments made will not be refunded."
        confirmText="Cancel Order"
        onConfirm={handleConfirmCancel}
        isLoading={isCancellingOrder}
      />
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
