"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SimpleSpinner from "@/components/simple-spinner";
import { getOrderMissingAddressFields } from "@/app/order/utils/get-order-missing-address";
import MissingAddressFieldWarning from "@/app/order/components/missing-address-field-warning";
import { ShippingAddress } from "../../../../../components/shipping-address";
import { fetchApi } from "../../../../../lib/api";
import EditShippingDetails from "../../../../../components/shipping/edit-shipping-details";
import Button from "../../../../../components/buttons/buttonv2";
import PhoneVerification from "../../../../../components/phone/phone-verification";
import type { CardOrder } from "../../../types";
import type { UserData } from "../../../../../lib/get-user";
import type { ShippingFormData } from "../../../../../components/shipping/edit-shipping-details";

type OrderShippingFormProps = {
  user?: UserData | null;
  orderId: string;
};

const OrderShippingForm = ({ user, orderId }: OrderShippingFormProps) => {
  const [showEditAddressForm, setShowEditAddressForm] = useState(false);
  const { push } = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<CardOrder>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await fetchApi(`/order/${orderId}`);
      return data;
    },
  });

  const updateShippingAddressMutation = useMutation({
    mutationFn: async (data: ShippingFormData) => {
      const response = await fetchApi(`/order/${orderId}/shipping-address`, {
        method: "PUT",
        body: {
          shippingAddress: data,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setShowEditAddressForm(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update address");
      console.error(error);
      setShowEditAddressForm(false);
    },
  });

  const missingFields = useMemo(() => {
    if (!order) {
      return [];
    }
    return getOrderMissingAddressFields(order);
  }, [order]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <SimpleSpinner />
      </div>
    );
  }

  const handleSaveAddress = (data: ShippingFormData) => {
    updateShippingAddressMutation.mutate(data);
  };

  if (showEditAddressForm && order) {
    return (
      <EditShippingDetails
        order={order}
        onBack={() => setShowEditAddressForm(false)}
        onSave={handleSaveAddress}
        isLoading={updateShippingAddressMutation.isPending}
        error={
          updateShippingAddressMutation.error?.message?.replace('Error: ', '') ||
          updateShippingAddressMutation.error?.toString()
        }
      />
    );
  }

  return (
    <div className="flex flex-1 self-center flex-col items-center gap-6">
      <div className="bg-white rounded-md border border-tertiary px-4 py-6 w-full">
        {missingFields.length > 0 && (
          <div className="mb-6">
            <MissingAddressFieldWarning missingFields={missingFields} />
          </div>
        )}

        <div className="flex space-between items-center border-b border-tertiary pb-6 mb-6">
          {order && <ShippingAddress order={order} />}
          <Button
            onClick={() => setShowEditAddressForm(true)}
            className="bg-white text-primary text-sm px-4 py-2 border-low-contrast border focus:border-medium-contrast"
          >
            Edit
          </Button>
        </div>
        {order && missingFields.length === 0 && (
          <div>
            <PhoneVerification
              userPhoneNumber={user?.phone}
              onSuccess={() => {
                push("/order/verify/source-of-funds");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderShippingForm;
