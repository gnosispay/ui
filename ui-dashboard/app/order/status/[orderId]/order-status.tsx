"use client";

import React from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { findCountry } from "@gnosispay/countries";
import { CircleNotch } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api";
import { DATE_FORMAT } from "../../../../lib/constants";
import { ProgressDots } from "../../../../components/progress-dots";
import { getCardShippedDate, getOrderDisplayStatus } from "./utils";
import type { CardOrder } from "../../types";

function OrderStatus({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useQuery<CardOrder>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await fetchApi(`/order/${orderId}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <CircleNotch className="w-10 h-10 animate-spin text-green-brand m-auto" />
    );
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  const status = getOrderDisplayStatus(order);
  const cardShippedDate = getCardShippedDate(order);

  return (
    <div className="bg-white px-4 py-6 rounded-md shadow w-full space-y-8">
      <div>
        <h2 className="text-sm text-gray-500 mb-2">Delivery address</h2>

        <div className="flex flex-col">
          <p className="text-sm">
            {order.address1} {order.address2}
          </p>
          <p className="text-sm">
            {order.city}, {order.state} {order.postalCode}
          </p>
          {order.country && (
            <p className="text-sm">{findCountry(order.country)?.name}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm text-gray-500 mb-4">Shipping status</h2>

        <div className="pl-1">
          <ProgressDots
            steps={[
              {
                title: "Ordered",
                description: format(order.createdAt, DATE_FORMAT),
              },
              {
                title: "Shipped",
                description: cardShippedDate
                  ? format(cardShippedDate, DATE_FORMAT)
                  : "We'll let you know when the card has shipped",
              },
              { title: "Estimated delivery", description: "2 weeks" },
            ]}
            stepReached={status.stepReached}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
