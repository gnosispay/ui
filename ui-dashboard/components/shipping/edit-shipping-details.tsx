"use client";

import { useForm, Controller } from "react-hook-form";
import { ArrowLeft } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Button from "@/components/buttons/buttonv2";
import Input from "@/components/inputs/input-base";
import type { CardOrder } from "@/app/order/types";

type EditShippingDetailsProps = {
  order: CardOrder;
  onBack: () => void;
  onSave: (data: ShippingFormData) => void;
  isLoading?: boolean;
  error?: string;
};

export type ShippingFormData = {
  address1: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
};

const EditShippingDetails = ({
  order,
  onBack,
  onSave,
  isLoading = false,
  error,
}: EditShippingDetailsProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    defaultValues: {
      address1: order.address1 || "",
      address2: order.address2 || "",
      postalCode: order.postalCode || "",
      city: order.city || "",
      country: order.country || "",
    },
  });

  const onSubmit = (data: ShippingFormData) => {
    onSave(data);
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    
    const errorMessages = Object.keys(errors).map(fieldName => {
      return errors[fieldName]?.message || `${fieldName} has an error`;
    });
    
    if (errorMessages.length === 1) {
      toast.error(errorMessages[0]);
    } else if (errorMessages.length > 1) {
      toast.error(`Please fix the following errors:\n• ${errorMessages.join('\n• ')}`);
    } else {
      toast.error("Please check your form and try again");
    }
  };

  return (
    <div className="flex flex-1 self-center flex-col items-center gap-6 w-full">
      <div className="bg-white rounded-md border border-tertiary px-4 py-6 w-full">
        <button
          onClick={onBack}
          className="flex items-center text-primary mb-6"
          disabled={isLoading}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex w-full flex-col gap-2">
          <span className="text-sm text-secondary">Address</span>
          <div>
            <Controller
              name="address1"
              control={control}
              rules={{ required: "Street address is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="address1"
                  placeholder="Street Name 17"
                  className="mt-2 bg-gray-50 text-gray-600"
                  readOnly
                  disabled
                />
              )}
            />
            <Controller
              name="address2"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="address2"
                  placeholder="Address line 2"
                  className="mt-2 bg-gray-50 text-gray-600"
                  readOnly
                  disabled
                />
              )}
            />
            <span className="text-sm text-gray-500 float-right -mt-9 mr-3">
              Optional
            </span>
            <Controller
              name="postalCode"
              control={control}
              rules={{ required: "Please enter a ZIP code" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="postalCode"
                  placeholder="ZIP code"
                  className={`mt-2 ${errors.postalCode ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              )}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.postalCode.message}
              </p>
            )}
            <Controller
              name="city"
              control={control}
              rules={{ required: "City is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="city"
                  placeholder="Milano"
                  className="mt-2 bg-gray-50 text-gray-600"
                  readOnly
                  disabled
                />
              )}
            />
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="country"
                  placeholder="Italy"
                  className="mt-2 bg-gray-50 text-gray-600"
                  readOnly
                  disabled
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditShippingDetails;
