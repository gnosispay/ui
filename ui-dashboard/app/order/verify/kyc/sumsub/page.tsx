import { auth } from "@/auth";
import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "@/app/order/utils/order-flow-redirect";

import { getSumsubAccessToken } from "./actions";
import { SumsubWaitlistWidget } from "./waitlist-widget";

const SumSubPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  await orderFlowRedirect(OrderFlowSteps.kyc);

  if (!userId) {
    return <>Need to be logged in</>;
  }

  const accessToken = await getSumsubAccessToken(userId);

  if (!accessToken) {
    return <></>;
  }

  return (
    <div className="min-h-screen lg:pt-10 w-full">
      <SumsubWaitlistWidget accessToken={accessToken} userId={userId} />
    </div>
  );
};

export default SumSubPage;
