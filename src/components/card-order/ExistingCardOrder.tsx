import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postApiV1OrderByOrderIdAttachCoupon, postApiV1OrderByOrderIdCancel, type CardOrder } from "@/client";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { usePendingCardOrders } from "@/hooks/useCardOrders";
import { InboxIcon } from "lucide-react";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { COUNTRIES, currencies } from "@/constants";

export const ExistingCardOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CardOrder | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { orders, isLoading: isLoadingOrders, refetch: refetchOrders } = usePendingCardOrders();
  const totalAmount = useMemo(() => order?.totalAmountEUR || 0, [order]);
  const discount = useMemo(() => order?.totalDiscountEUR || 0, [order]);
  const finalAmount = useMemo(() => {
    return totalAmount - discount;
  }, [totalAmount, discount]);

  useEffect(() => {
    if (isLoadingOrders) return;

    if (orders.length > 0) {
      const theOne = orders.find((order) => order.id === orderId);
      if (theOne) {
        setOrder(theOne);
      } else {
        setIsNotFound(true);
      }
    } else {
      setIsNotFound(true);
    }
  }, [orders, orderId, isLoadingOrders]);

  const handleApplyCoupon = useCallback(async () => {
    if (!order || !couponCode.trim()) return;

    try {
      setIsApplyingCoupon(true);
      const { data, error } = await postApiV1OrderByOrderIdAttachCoupon({
        path: { orderId: order.id },
        body: { couponCode: couponCode.trim() },
      });

      if (error) {
        console.error("Error applying coupon:", error);
        toast.error(<CollapsedError title="Failed to apply coupon" error={error} />);
        return;
      }

      if (data) {
        toast.success("Coupon applied successfully");
        // Refresh order data to get updated totals
        await refetchOrders();
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(<CollapsedError title="Failed to apply coupon" error={error} />);
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [order, couponCode, refetchOrders]);

  const handleCancelOrder = useCallback(async () => {
    if (!order) return;

    try {
      setIsCancelling(true);
      const { error } = await postApiV1OrderByOrderIdCancel({
        path: { orderId: order.id },
      });

      if (error) {
        console.error("Error cancelling order:", error);
        toast.error(<CollapsedError title="Failed to cancel order" error={error} />);
        return;
      }

      toast.success("Card order cancelled successfully");
      navigate("/cards");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(<CollapsedError title="Failed to cancel order" error={error} />);
    } finally {
      setIsCancelling(false);
      setShowCancelConfirmation(false);
    }
  }, [order, navigate]);

  const formatAddress = useCallback((order: CardOrder) => {
    const parts = [order.address1, order.address2, order.postalCode, order.city, order.state, order.country].filter(
      Boolean,
    );

    return parts.length > 0 ? (
      <div className="space-y-1">
        {order.address1 && <div>{order.address1}</div>}
        {order.address2 && <div>{order.address2}</div>}
        {order.postalCode && <div>{order.postalCode}</div>}
        {order.city && <div>{order.city}</div>}
        {order.state && <div>{order.state}</div>}
        {order.country && <div>{COUNTRIES.find((c) => c.alpha2 === order.country)?.name}</div>}
      </div>
    ) : (
      <div>No address provided</div>
    );
  }, []);

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
        <div className="text-center text-secondary">Order not found</div>
      </div>
    );
  }

  if (isLoadingOrders || !order) {
    return (
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              {/* Order Details */}
              <div className="bg-card rounded-xl p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Order details</h3>
                <div className="space-y-3">
                  {order.embossedName && (
                    <div>
                      <div className="text-sm text-muted-foreground">Name on card</div>
                      <div className="font-medium">{order.embossedName}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-xl p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Shipping address</h3>
                <div className="text-sm">{formatAddress(order)}</div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-card rounded-xl p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card order</span>
                    <span className="font-medium">{formatDisplayAmount(totalAmount, currencies.EUR)}</span>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDisplayAmount(totalAmount, currencies.EUR)}
                  </div>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-success">-{formatDisplayAmount(discount, currencies.EUR)}</span>
                  </div>
                )}
              </div>

              {/* Discount Coupon */}
              <div className="bg-card rounded-xl p-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Discount coupon</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="bg-button-bg hover:bg-button-bg-hover text-button-black"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="bg-card rounded-xl p-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>TOTAL</span>
                  <div className="text-right">
                    <div>{finalAmount.toFixed(2)} EURe</div>
                    <div className="text-sm text-muted-foreground font-normal">€ {finalAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Gas Fee */}
                {finalAmount > 0 && (
                  <div className="flex justify-between text-sm mt-4 pt-4 border-t">
                    <span className="text-muted-foreground">GAS FEE</span>
                    <div className="text-right">
                      <div>~0.01 xDAI</div>
                      <div className="text-muted-foreground">€ 0.01</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Actions */}
          {(order.status === "PENDINGTRANSACTION" || order.status === "FAILEDTRANSACTION") && (
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCancelConfirmation(true)}>
                Cancel Order
              </Button>
              <Button
                className="bg-button-bg hover:bg-button-bg-hover text-button-black"
                onClick={() => toast.info("Payment flow will be implemented")}
              >
                {order.status === "PENDINGTRANSACTION" ? "Complete Payment" : "Retry Payment"}
              </Button>
            </div>
          )}
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
    </div>
  );
};
