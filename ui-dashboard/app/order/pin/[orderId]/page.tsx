import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import getUser from "../../../../lib/get-user";
import {
  orderFlowRedirect,
  OrderFlowSteps,
} from "../../utils/order-flow-redirect";

const SetPinForm = dynamic(() => import("./form"), { ssr: false });

const SetPinPage = async ({ params }: { params: { orderId: string } }) => {
  const orderId = params.orderId;
  const user = await getUser(cookies);

  await orderFlowRedirect(OrderFlowSteps.pin);

  return <SetPinForm orderId={orderId} user={user} />;
};

export default SetPinPage;
