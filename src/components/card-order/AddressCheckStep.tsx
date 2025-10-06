import { useCallback, useEffect, useMemo, useState } from "react";
import { postApiV1OrderByOrderIdCreateCard, putApiV1OrderByOrderIdConfirmPayment, type CardOrder } from "@/client";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";

import { useOrders } from "@/context/OrdersContext";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { COUNTRIES, COUPON_CODES, currencies } from "@/constants";
import { InboxIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddressCheckSkeleton } from "./AddressCheckSkeleton";

export interface AddressCheckStepProps {
  orderId: string;
  onNext: (cardToken: string) => void;
}

export const AddressCheckStep = ({ orderId, onNext }: AddressCheckStepProps) => {
  const [order, setOrder] = useState<CardOrder | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const { orders, isLoading: isLoadingOrders, applyCoupon, cancelOrderWithConfirmation, refetch } = useOrders();
  const navigate = useNavigate();

  const totalAmount = useMemo(() => order?.totalAmountEUR || 0, [order]);
  const discount = useMemo(() => order?.totalDiscountEUR || 0, [order]);
  const finalAmount = useMemo(() => {
    return totalAmount - discount;
  }, [totalAmount, discount]);

  const canCancel = useMemo(() => {
    if (!order) return false;
    return ["PENDINGTRANSACTION"].includes(order.status);
  }, [order]);

  const canSubmit = useMemo(() => {
    if (!order) return false;
    return ["PENDINGTRANSACTION", "TRANSACTIONCOMPLETE", "READY"].includes(order.status);
  }, [order]);

  const canContinue = useMemo(() => {
    if (!order) return false;
    return !["FAILEDTRANSACTION", "CANCELLED", "CARDCREATED"].includes(order.status);
  }, [order]);

  useEffect(() => {
    if (!order) return;

    if (!canContinue) {
      setGlobalError(`This order has already been processed, status: ${order.status}`);
      return;
    }
  }, [canContinue, order]);

  useEffect(() => {
    if (isLoadingOrders) return;

    if (orders.length > 0) {
      const theOne = orders.find((order) => order.id === orderId);
      if (theOne) {
        setOrder(theOne);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
      }
    } else {
      setIsNotFound(true);
    }
  }, [orders, orderId, isLoadingOrders]);

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

  const handleApplyCoupon = useCallback(
    async (order: CardOrder) => {
      try {
        setIsApplyingCoupon(true);
        await applyCoupon(order.id);
      } catch {
        // Error handling is already done in the context
      } finally {
        setIsApplyingCoupon(false);
      }
    },
    [applyCoupon],
  );

  useEffect(() => {
    if (!order) return;
    if (isApplyingCoupon) return;

    // Make sure any order is for free using our coupon code
    if (!order.couponCode || order.couponCode.toLowerCase() !== COUPON_CODES.toLowerCase()) {
      handleApplyCoupon(order);
    }
  }, [order, handleApplyCoupon, isApplyingCoupon]);

  const handleCompleteOrder = useCallback(async () => {
    if (!order) return;

    try {
      setIsCompletingOrder(true);
      setGlobalError(null);

      // Although it's for free, we need to confirm the payment
      // to make sure the order is in the correct state
      if (order.status === "PENDINGTRANSACTION") {
        const { error: confirmError } = await putApiV1OrderByOrderIdConfirmPayment({
          path: { orderId: order.id },
        });

        if (confirmError) {
          const errorMessage = extractErrorMessage(confirmError, "Failed to confirm payment");
          setGlobalError(errorMessage);
          console.error("Error confirming payment:", confirmError);
          return;
        }
      }

      const { data: createData, error: createError } = await postApiV1OrderByOrderIdCreateCard({
        path: { orderId: order.id },
        body: {}, // PIN will be set via PSE after card creation
      });

      if (createError) {
        const errorMessage = extractErrorMessage(createError, "Failed to create card");
        setGlobalError(errorMessage);
        console.error("Error creating card:", createError);
        return;
      }

      if (!createData || !createData.cardToken) {
        setGlobalError("An error occurred while creating the card, no cardToken was returned");
        console.error("Error creating card:", createData);
        return;
      }

      const { cardToken } = createData;
      onNext(cardToken);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "An unexpected error occurred");
      setGlobalError(errorMessage);
      console.error("Error completing order:", error);
    } finally {
      refetch();
      setIsCompletingOrder(false);
    }
  }, [order, onNext, refetch]);

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
        <div className="text-center text-secondary">Order not found</div>
      </div>
    );
  }

  if (!order || isLoadingOrders || isApplyingCoupon) {
    return <AddressCheckSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Confirm Order Details</h1>
        <p className="text-muted-foreground mt-2">Please review your order details and shipping address</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div className="space-y-6">
          {/* Order Details */}
          <div className="bg-card rounded-lg p-6">
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
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Shipping address</h3>
            <div className="text-sm">{formatAddress(order)}</div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-card rounded-lg p-6">
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

          <div className="bg-card rounded-lg p-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>TOTAL</span>
              <div className="text-right">
                <div>{finalAmount.toFixed(2)} EURe</div>
                <div className="text-sm text-muted-foreground font-normal">€ {finalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Error Display */}
      {globalError && <StandardAlert variant="destructive" description={globalError} className="mb-6" />}

      <div className="flex justify-end gap-3 mt-6">
        {canCancel && (
          <Button
            variant="outline"
            disabled={isCompletingOrder || isApplyingCoupon}
            onClick={() => cancelOrderWithConfirmation({ orderId, onSuccess: () => navigate("/") })}
          >
            Cancel Order
          </Button>
        )}
        <Button
          className="bg-button-bg hover:bg-button-bg-hover text-button-black"
          onClick={handleCompleteOrder}
          loading={isCompletingOrder || isApplyingCoupon}
          disabled={isCompletingOrder || isApplyingCoupon || !canSubmit}
        >
          Create Card & Set PIN
        </Button>
      </div>
    </div>
  );
};
