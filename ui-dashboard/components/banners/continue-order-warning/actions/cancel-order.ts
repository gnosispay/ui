"use server";

import prisma from "@gnosispay/prisma";
import { CANCELLABLE_ORDER_STATUSES } from "@gnosispay/prisma";
import { CardOrderStatus } from "@gnosispay/prisma/client";
import { auth } from "@/auth";

export const cancelOrder = async ({ orderId }: { orderId: string }) => {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cardOrders: true,
    },
  });
  if (!user) {
    return { error: "User not found in session" };
  }

  const orderToCancel = user.cardOrders.find((order) => order.id === orderId);
  if (!orderToCancel) {
    return { error: "Couldn't find belonging order for the signed-in user" };
  }

  if (!CANCELLABLE_ORDER_STATUSES.includes(orderToCancel.status)) {
    return {
      error: `Can't cancel order ${orderToCancel.id} due to it's uncancellable status: ${orderToCancel.status}`,
    };
  }

  await prisma.cardOrder.update({
    where: {
      id: orderId,
    },
    data: {
      status: CardOrderStatus.CANCELLED,
    },
  });
};
