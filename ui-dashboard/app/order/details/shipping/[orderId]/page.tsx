import { cookies } from "next/headers";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";
import {
  OrderFlowSteps,
  orderFlowRedirect,
} from "../../../utils/order-flow-redirect";
import { TitleSubtitle } from "../../../../../components/layout/title-subtitle";
import getUser from "../../../../../lib/get-user";
import OrderShippingForm from "./form";

const ShippingPage = async ({ params }: { params: { orderId: string } }) => {
  const user = await getUser(cookies);

  await orderFlowRedirect(OrderFlowSteps.shippingPhone);

  return (
    <>
      <MarketingPageviewEvent
        event={GTM_EVENTS.PAGE_VIEWS.ORDER_SHIPPING_DETAILS}
      />

      <div className="space-y-8 flex-1">
        <TitleSubtitle
          title="Shipping details"
          subtitle="Confirm your shipping details"
        />
        <OrderShippingForm user={user} orderId={params.orderId} />
      </div>
    </>
  );
};

export default ShippingPage;
