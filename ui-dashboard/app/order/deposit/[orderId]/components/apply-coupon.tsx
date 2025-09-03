import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchApi } from "@/lib/api";
import Button from "../../../../../components/buttons/buttonv2";

type CouponForm = {
  coupon: string;
};

export const ApplyCoupon = ({
  cardOrderId,
  appliedCouponCode,
}: {
  cardOrderId: string;
  appliedCouponCode?: string;
}) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState } = useForm<CouponForm>();

  const attachCoupon = useCallback(async (couponCode?: string) => {
    const { data } = await fetchApi(`/order/${cardOrderId}/attach-coupon`, {
      method: "POST",
      body: {
        couponCode,
      },
    });

    return data;
  }, []);

  const onSubmit = async (data: CouponForm) => {
    if (!data.coupon) {
      return toast.error("Please enter a coupon code");
    }

    try {
      const valid = await attachCoupon(data.coupon);
      // TODO: test validations
      if (!valid) {
        return toast.error("Invalid coupon code");
      }

      queryClient.invalidateQueries({ queryKey: ["order", cardOrderId] });

      return toast.success("Coupon code applied!");
    } catch (e: any) {
      if ("message" in e) {
        return toast.error(e.message);
      }

      return toast.error(
        "Something went wrong, please try again later or contact support",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col space-y-2">
        <span className="text-sm text-secondary">Discount coupon</span>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Enter coupon code"
            className="border border-low-contrast rounded-md w-full px-4 py-2"
            {...register("coupon")}
          />
          <Button
            className="bg-primary text-white rounded-md py-2"
            disabled={formState.isSubmitting || !!appliedCouponCode}
          >
            {formState.isSubmitting ? "Applying..." : "Apply"}
          </Button>
        </div>
        {appliedCouponCode && (
          <div className="flex items-center space-x-2">
            <Check className="text-success" />
            <span className="text-sm text-success">Discount applied</span>
          </div>
        )}
      </div>
    </form>
  );
};
