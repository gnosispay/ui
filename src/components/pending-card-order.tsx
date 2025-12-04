import { useCallback } from "react";
import { Button } from "./ui/button";

import type { CardOrder } from "@/client";
import { Clock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrdersContext";

export const PendingCardOrder = () => {
  const navigate = useNavigate();
  const { pendingPhysicalOrders, isLoading, cancelOrderWithConfirmation } = useOrders();

  const handleResumeOrder = useCallback(
    (orderId: string) => {
      navigate(`/card-order/${orderId}`);
    },
    [navigate],
  );

  const getStatusText = useCallback((status: CardOrder["status"]) => {
    switch (status) {
      case "PENDINGTRANSACTION":
        return "Pending Confirmation";
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
    <div className="bg-card border border-border rounded-lg p-4 mb-6" data-testid="pending-card-order">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">
          <Package className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">Pending Card Order</h3>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground" data-testid="pending-order-status">
              {getStatusText(pendingOrder.status)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleResumeOrder(pendingOrder.id)}
              className="flex-1"
              data-testid="pending-order-resume-button"
            >
              Resume
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelOrderWithConfirmation({ orderId: pendingOrder.id })}
              className="flex-1"
              data-testid="pending-order-cancel-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
