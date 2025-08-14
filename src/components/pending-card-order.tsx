import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ConfirmationDialog } from "./modals/confirmation-dialog";
import { getApiV1Order, postApiV1OrderByOrderIdCancel } from "@/client";
import { toast } from "sonner";
import { CollapsedError } from "./collapsedError";
import { Clock, Package } from "lucide-react";

interface CardOrder {
  id: string;
  status:
    | "PENDINGTRANSACTION"
    | "TRANSACTIONCOMPLETE"
    | "CONFIRMATIONREQUIRED"
    | "READY"
    | "CARDCREATED"
    | "FAILEDTRANSACTION"
    | "CANCELLED";
  embossedName?: string | null;
  createdAt: string;
  totalAmountEUR?: number | null;
}

export const PendingCardOrder = () => {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getApiV1Order();

      if (error) {
        console.error("Error fetching card orders:", error);
        toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching card orders:", error);
      toast.error(<CollapsedError title="Failed to fetch card orders" error={error} />);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "PENDINGTRANSACTION" ||
        order.status === "TRANSACTIONCOMPLETE" ||
        order.status === "CONFIRMATIONREQUIRED" ||
        order.status === "READY",
    );
  }, [orders]);

  const handleCancelOrder = useCallback(async () => {
    if (!orderToCancel) return;

    try {
      setIsCancelling(true);
      const { error } = await postApiV1OrderByOrderIdCancel({
        path: { orderId: orderToCancel },
      });

      if (error) {
        console.error("Error cancelling order:", error);
        toast.error(<CollapsedError title="Failed to cancel order" error={error} />);
        return;
      }

      toast.success("Card order cancelled successfully");
      // Refresh orders after successful cancellation
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(<CollapsedError title="Failed to cancel order" error={error} />);
    } finally {
      setIsCancelling(false);
      setShowCancelConfirmation(false);
      setOrderToCancel(null);
    }
  }, [orderToCancel, fetchOrders]);

  const handleCancelClick = useCallback((orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirmation(true);
  }, []);

  const handleResumeOrder = useCallback((orderId: string) => {
    // Mock implementation for now
    toast.info(`Resume order ${orderId} - Coming soon!`);
  }, []);

  const getStatusText = useCallback((status: CardOrder["status"]) => {
    switch (status) {
      case "PENDINGTRANSACTION":
        return "Pending Payment";
      case "TRANSACTIONCOMPLETE":
        return "Verification Required";
      case "CONFIRMATIONREQUIRED":
        return "Verification Needed";
      case "READY":
        return "Ready for Processing";
      default:
        return status;
    }
  }, []);

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (pendingOrders.length === 0) {
    return null; // Don't show anything if no pending orders
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Package className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Pending Card Order{pendingOrders.length > 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have {pendingOrders.length} pending card order{pendingOrders.length > 1 ? "s" : ""} that need
              {pendingOrders.length === 1 ? "s" : ""} attention.
            </p>

            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{getStatusText(order.status)}</span>
                    </div>
                    {order.totalAmountEUR && (
                      <span className="text-sm text-muted-foreground">€{order.totalAmountEUR.toFixed(2)}</span>
                    )}
                  </div>

                  {order.embossedName && (
                    <p className="text-sm text-muted-foreground mb-3">Card for: {order.embossedName}</p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleResumeOrder(order.id)} className="flex-1">
                      Resume
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancelClick(order.id)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        title="Cancel Card Order"
        iconColor="text-destructive"
        message="Are you sure you want to cancel this card order? This action cannot be undone and any payments made will not be refunded."
        confirmText="Cancel Order"
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </>
  );
};
