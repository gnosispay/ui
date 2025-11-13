import dynamic from "next/dynamic";
import React from "react";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";
import { getKycUser } from "../../verify/kyc/actions";
import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "../../utils/order-flow-redirect";

const CustomizeForm = dynamic(() => import("./form"), {
  loading: () => <p>Loading...</p>,
});

const CustomizePage = async () => {
  await orderFlowRedirect(OrderFlowSteps.customize);

  const kycUser = await getKycUser();

  return (
    <>
      <MarketingPageviewEvent event={GTM_EVENTS.PAGE_VIEWS.ORDER_CUSTOMIZE} />
      <CustomizeForm fullName={kycUser?.person?.full_name} />
    </>
  );
};

export default CustomizePage;
