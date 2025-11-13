import { cookies } from "next/headers";
import { getKycUser } from "@/app/order/verify/kyc/actions";
import MarketingPageviewEvent from "@/components/marketing/marketing-pageview-event";
import { GTM_EVENTS } from "@/lib/gtm";
import getUser from "../../../lib/get-user";
import {
  OrderFlowSteps,
  orderFlowRedirect,
} from "../../order/utils/order-flow-redirect";
import WelcomeForm from "./form";

export default async function Page() {
  const user = await getUser(cookies);
  const kycUser = await getKycUser();

  if (user?.cardOrders.length || kycUser) {
    await orderFlowRedirect(OrderFlowSteps.welcome);
  }

  return (
    <>
      <MarketingPageviewEvent event={GTM_EVENTS.PAGE_VIEWS.WELCOME} />

      <WelcomeForm />
    </>
  );
}
