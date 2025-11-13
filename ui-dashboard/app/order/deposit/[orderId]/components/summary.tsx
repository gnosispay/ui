import Link from "next/link";
import { Tag } from "@phosphor-icons/react/dist/ssr";
import classNames from "classnames";
import { useAccount } from "wagmi";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import {
  CARD_GAS_FEE_XDAI,
  MONAVATE_PRIVACY_POLICY_URL,
  MONAVATE_TOS_URL,
} from "../../../../../lib/constants";
import Button from "../../../../../components/buttons/buttonv2";
import Spinner from "../../../../../components/spinner";
import { getTotalPriceEUR } from "../utils/price";
import { ApplyCoupon } from "./apply-coupon";
import type { CardOrder } from "../../../types";

export const Summary = ({
  paymentStatus,
  canClickOrder,
  onOrder,
  isExecuting,
  cardOrder,
}: {
  paymentStatus: string;
  canClickOrder?: boolean;
  onOrder: () => void;
  isExecuting: boolean;
  cardOrder: CardOrder;
}) => {
  const { isConnected } = useAccount();
  const totalPriceDisplay = getTotalPriceEUR(cardOrder).toFixed(2);
  const cardIsFree = cardOrder.totalAmountEUR === cardOrder.totalDiscountEUR;

  return (
    <div className="bg-white rounded-md border border-tertiary p-6 space-y-6">
      <h3 className="text-xl">Summary</h3>

      <div className="space-y-4">
        <div className="space-x-2 flex">
          <span className="text-secondary flex-1">Card order</span>
          <div className="text-primary flex-1 text-right">
            <p
              className={classNames({
                "line-through": cardIsFree,
              })}
            >
              {cardOrder.totalAmountEUR} EURe
            </p>
            <p
              className={classNames("text-sm text-secondary", {
                "line-through": cardIsFree,
              })}
            >
              € {cardOrder.totalAmountEUR}
            </p>
          </div>
        </div>
        {cardOrder.couponCode && (
          <div className="space-x-2 flex">
            <span className="text-secondary text-sm flex-1">
              <Tag className="inline mr-1 mb-1" />
              {cardOrder.couponCode} applied
            </span>
            {cardIsFree ? (
              <div className="text-primary flex-1 text-right">
                <p>FREE</p>
                <p className="text-sm text-secondary">€0.00</p>
              </div>
            ) : (
              <div className="text-primary flex-1 text-right">
                <p>-{cardOrder.totalDiscountEUR} EURe</p>
                <p className="text-sm text-secondary">
                  -€ {cardOrder.totalDiscountEUR}
                </p>
              </div>
            )}
          </div>
        )}
        <hr />
        <ApplyCoupon
          cardOrderId={cardOrder.id}
          appliedCouponCode={cardOrder.couponCode || undefined}
        />
        <div className="space-x-2 flex">
          <span className="text-primary flex-1">TOTAL</span>
          <div className="text-primary flex-1 text-right">
            <p>{totalPriceDisplay} EURe</p>
            <p className="text-sm text-secondary">€ {totalPriceDisplay}</p>
          </div>
        </div>
        {!cardIsFree && (
          <div className="space-x-2 flex">
            <span className="text-primary flex-1">GAS FEE</span>
            <div className="text-primary flex-1 text-right">
              <p>~{CARD_GAS_FEE_XDAI} xDAI</p>
              <p className="text-sm text-secondary">€ {CARD_GAS_FEE_XDAI}</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-secondary">
        By clicking below and completing your order, you agree to{" "}
        {`Monavate's `}
        <Link href={MONAVATE_TOS_URL} target="_blank" className="underline">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          href={MONAVATE_PRIVACY_POLICY_URL}
          target="_blank"
          className="underline"
        >
          Privacy Policy
        </Link>
        . Gnosis Pay manages the Card program on behalf of Monavate, as further
        described in the Monavate Terms & Conditions.
      </p>

      {isConnected || cardIsFree ? (
        <Button className="w-full" onClick={onOrder} disabled={!canClickOrder}>
          {cardIsFree ? "Confirm" : "Pay"}
        </Button>
      ) : (
        <ConnectWalletButton className="w-full py-3" />
      )}

      {(isExecuting || paymentStatus) && (
        <div className="text-primary text-sm space-x-2 flex items-center">
          {isExecuting && <Spinner className="h-4 w-4" />}
          <p>{paymentStatus}</p>
        </div>
      )}
    </div>
  );
};
