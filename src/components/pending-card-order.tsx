import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { ConfirmationDialog } from "./modals/confirmation-dialog";
import { postApiV1OrderByOrderIdCancel, type CardOrder } from "@/client";
import { toast } from "sonner";
import { CollapsedError } from "./collapsedError";
import { Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePendingCardOrders } from "@/hooks/useCardOrders";

export const PendingCardOrder = () => {
  const navigate = useNavigate();
  const { pendingPhysicalOrders, isLoading, refetch } = usePendingCardOrders();
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
      refetch();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(<CollapsedError title="Failed to cancel order" error={error} />);
    } finally {
      setIsCancelling(false);
      setShowCancelConfirmation(false);
      setOrderToCancel(null);
    }
  }, [orderToCancel, refetch]);

  const handleCancelClick = useCallback((orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirmation(true);
  }, []);

  const handleResumeOrder = useCallback(
    (orderId: string) => {
      navigate(`/card-order/${orderId}`);
    },
    [navigate],
  );

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

  if (pendingPhysicalOrders.length === 0) {
    return null; // Don't show anything if no pending orders
  }

  const pendingOrder = pendingPhysicalOrders[0];

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Package className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">Pending Card Order</h3>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{getStatusText(pendingOrder.status)}</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => handleResumeOrder(pendingOrder.id)} className="flex-1">
                Resume
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCancelClick(pendingOrder.id)} className="flex-1">
                Cancel
              </Button>
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
