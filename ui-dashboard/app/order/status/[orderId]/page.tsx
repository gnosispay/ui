import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";

import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "../../utils/order-flow-redirect";
import OrderStatus from "./order-status";
import { ReceivedCard } from "./received-card";
import { Rewards } from "./components/rewards";

const OrderStatusPage = async ({ params }: { params: { orderId: string } }) => {
  await orderFlowRedirect(OrderFlowSteps.status);

  return (
    <>
      <MarketingPageviewEvent event={GTM_EVENTS.PAGE_VIEWS.ORDER_STATUS} />

      <div className="flex-1 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-brand">{`Your card is on its way!`}</h1>
        </div>
        <ReceivedCard />
        <div className="flex gap-4">
          <div className="flex-1">
            <OrderStatus orderId={params.orderId} />
          </div>
          <div className="flex-1">
            <Rewards />
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderStatusPage;
