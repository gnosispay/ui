import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";
import getUser from "../../../../lib/get-user";
import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "../../utils/order-flow-redirect";

const OrderDepositForm = dynamic(() => import("./form"), { ssr: false });

const OrderDepositPage = async ({
  params,
}: {
  params: { orderId: string };
}) => {
  const orderId = params.orderId;
  const user = await getUser(cookies);

  await orderFlowRedirect(OrderFlowSteps.deposit);

  return (
    <>
      <MarketingPageviewEvent event={GTM_EVENTS.PAGE_VIEWS.ORDER_DEPOSIT} />

      <OrderDepositForm orderId={orderId} user={user} />
    </>
  );
};

export default OrderDepositPage;
