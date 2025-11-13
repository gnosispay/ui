import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/get-user";
import { getKycUser } from "@/app/order/verify/kyc/actions";
import { getOrderMissingAddressFields } from "./get-order-missing-address";

export enum OrderFlowSteps {
  welcome = "welcome",
  kyc = "kyc",
  kycAuthorize = "kycAuthorize",
  shippingPhone = "shippingPhone",
  sourceOfFunds = "sourceOfFunds",
  customize = "customize",
  deposit = "deposit",
  pin = "pin",
  status = "status",
}

export const orderFlowRedirect = async (step: OrderFlowSteps) => {
  const user = await getUser(cookies);
  const kycUser = await getKycUser();

  const existingPendingCardOrder = user?.cardOrders.find((order) =>
    ["PENDINGTRANSACTION"].includes(order.status),
  );

  const readyCardOrder = user?.cardOrders.find((order) =>
    ["READY"].includes(order.status),
  );

  const createdCardOrder = user?.cardOrders.find((order) =>
    ["CARDCREATED"].includes(order.status),
  );

  const pendingOrderMissingAddressFields = existingPendingCardOrder
    ? getOrderMissingAddressFields(existingPendingCardOrder)
    : [];

  const pendingOrderMissingShippingDetails =
    !user?.phoneVerified || pendingOrderMissingAddressFields.length > 0;

  // Card is READY, no PENDINGTRANSACTION cards
  if (
    kycUser?.approved &&
    user?.phoneVerified &&
    user?.sourceOfFunds?.length &&
    !existingPendingCardOrder &&
    readyCardOrder &&
    ![OrderFlowSteps.status, OrderFlowSteps.pin].includes(step)
  ) {
    return redirect(`/order/status/${readyCardOrder?.id}`);
  }

  // Card is PENDINGTRANSACTION, no READY cards
  if (
    kycUser?.approved &&
    !pendingOrderMissingShippingDetails &&
    user?.sourceOfFunds?.length &&
    existingPendingCardOrder &&
    !readyCardOrder &&
    step !== OrderFlowSteps.deposit
  ) {
    return redirect(`/order/deposit/${existingPendingCardOrder.id}`);
  }

  // Card is PENDINGTRANSACTION, READY card exists
  // Move user to deposit, as it is probably their 2nd card
  if (
    kycUser?.approved &&
    !pendingOrderMissingShippingDetails &&
    user?.sourceOfFunds?.length &&
    existingPendingCardOrder &&
    readyCardOrder &&
    step !== OrderFlowSteps.deposit &&
    step !== OrderFlowSteps.status
  ) {
    return redirect(`/order/deposit/${existingPendingCardOrder?.id}`);
  }

  if (
    kycUser?.approved &&
    user?.sourceOfFunds?.length &&
    !existingPendingCardOrder &&
    !readyCardOrder &&
    !createdCardOrder &&
    step !== OrderFlowSteps.customize &&
    user.country !== "BR"
  ) {
    return redirect("/order/details/customize");
  }

  if (
    kycUser?.approved &&
    pendingOrderMissingShippingDetails &&
    existingPendingCardOrder &&
    step !== OrderFlowSteps.shippingPhone
  ) {
    return redirect(`/order/details/shipping/${existingPendingCardOrder?.id}`);
  }

  if (
    kycUser?.approved &&
    !user?.sourceOfFunds?.length &&
    step !== OrderFlowSteps.sourceOfFunds
  ) {
    return redirect("/order/verify/source-of-funds");
  }

  if (
    kycUser?.approved &&
    [OrderFlowSteps.kyc, OrderFlowSteps.kycAuthorize].includes(step) &&
    user?.sourceOfFunds?.length &&
    user.country !== "BR"
  ) {
    return redirect("/order/details/customize");
  }

  if (
    kycUser?.approved &&
    [OrderFlowSteps.kyc, OrderFlowSteps.kycAuthorize].includes(step) &&
    !user?.sourceOfFunds?.length
  ) {
    return redirect("/order/verify/source-of-funds");
  }

  if (
    !kycUser &&
    ![
      OrderFlowSteps.kyc,
      OrderFlowSteps.kycAuthorize,
      OrderFlowSteps.sourceOfFunds,
    ].includes(step)
  ) {
    return redirect("/order/kyc");
  }
};
