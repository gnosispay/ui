import { cookies } from "next/headers";
import {
  CardOrderStatus,
  KYCVerificationConsolidatedStatus,
} from "@gnosispay/prisma/client";
import Footer from "@/components/footer";
import getUser from "@/lib/get-user";
import Sidebar from "@/components/sidebar";
import { ContinueOrderWarning } from "@/components/banners/continue-order-warning";
import { NoActiveCardsWarning } from "@/components/banners/no-active-cards-warning";
import { NoOrdersWarning } from "@/components/banners/no-order-found";
import { OrderPendingWarning } from "@/components/banners/order-pending-warning";
import { RedoKycWarning } from "@/components/banners/redo-kyc-warning";
import { MissingInfoKYcWarning } from "@/components/banners/missing-info-kyc-warning";
import { getKYCApprovals } from "../order/verify/kyc/actions";
import DelayNotifications from "../../components/delay-notifications";
import { getNonVoidedCards } from "./(cards)/cards/actions";


const UNCOMPLETED_ORDER_STATUSES: CardOrderStatus[] = [
  CardOrderStatus.PENDINGTRANSACTION,
  CardOrderStatus.TRANSACTIONCOMPLETE,
  CardOrderStatus.CONFIRMATIONREQUIRED,
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser(cookies);
  const needsKYCResubmission = user?.kycProvider?.consolidatedStatus ===
    KYCVerificationConsolidatedStatus.notStarted ||
    user?.kycProvider?.consolidatedStatus ===
      KYCVerificationConsolidatedStatus.documentsRequested;

  const cards = await getNonVoidedCards();
  const kycApproval = await getKYCApprovals();

  const firstActiveCard = cards.find((card) => card.activatedAt !== null);
  const hasNoCards = cards.length === 0;
  const orders = user?.cardOrders.filter(
    (order) => order.status !== CardOrderStatus.CANCELLED,
  );
  const hasOrders = orders && orders?.length > 0;

  const showActivateCardWarning = cards.length > 0 && !firstActiveCard;
  const showMakeAnOrderWarning = !hasOrders && hasNoCards;
  const showOrderPendingWarning = hasOrders && hasNoCards;

  const showKycRedoWarning = !kycApproval?.approved && cards.length > 0;

  const uncompletedOrders = orders?.filter((order) =>
    UNCOMPLETED_ORDER_STATUSES.includes(order.status),
  );
  const hasUncompletedOrders = uncompletedOrders && uncompletedOrders.length > 0;

  const pendingOrder = orders?.find((order) => order.status === "READY");


  const gnosisPayAccountData = user?.accounts.filter(
    (account: any) => account.type === "L1SAFE",
  );
  const hasGnosisPayAccount = gnosisPayAccountData && gnosisPayAccountData.length > 0;

  return (
    <>
      <Sidebar />

      <main className="pt-[25px] sm:pt-[100px] pb-0 lg:pl-72 bg-gp-bg-subtle min-h-screen flex flex-col">
        {needsKYCResubmission && <RedoKycWarning />}
        {showKycRedoWarning && <MissingInfoKYcWarning />}
        {showActivateCardWarning && <NoActiveCardsWarning />}
        {showMakeAnOrderWarning && <NoOrdersWarning />}
        {showOrderPendingWarning && pendingOrder && (
          <OrderPendingWarning pendingOrderId={pendingOrder.id} />
        )}
        {hasUncompletedOrders && (
          <ContinueOrderWarning orderId={uncompletedOrders[0]!.id} />
        )}
        {/* TODO: Consider whether we should completely remove the infra outage warning. */}
        {/* {false && <InfraOutageWarning />} */}
        <div className="flex-grow">{children}</div>
        {hasGnosisPayAccount && (
          <DelayNotifications account={gnosisPayAccountData[0]!.address as `0x${string}`} />
        )}

        <div className="flex-none">
          <Footer />
        </div>
      </main>
    </>
  );
}

/**
 * Explicitly state we are using Dynamic rendering here.
 * This prevents build-time errors which are sometimes silent.
 */
export const dynamic = "force-dynamic";
