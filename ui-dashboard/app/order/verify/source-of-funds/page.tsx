import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";
import getUser from "@/lib/get-user";
import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "../../utils/order-flow-redirect";
import { getKycUser } from "../kyc/actions";

const SourceOfFunds = dynamic(() => import("."), { ssr: false });

const SourceOfFundsPage = async () => {
  await orderFlowRedirect(OrderFlowSteps.sourceOfFunds);

  const kycUser = await getKycUser();
  const user = await getUser(cookies);

  return (
    <>
      <MarketingPageviewEvent
        event={GTM_EVENTS.PAGE_VIEWS.ORDER_SOURCE_OF_FUNDS}
      />

      <SourceOfFunds kycUser={kycUser} user={user} />
    </>
  );
};

export default SourceOfFundsPage;
