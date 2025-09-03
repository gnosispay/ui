"use client";

import {
  ScanSmiley,
  Basket,
  Cardholder,
  LockKey,
} from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";
import { useViewport } from "@/hooks/use-viewport";
import { OrderStepper, type Step } from "../../../components/order-stepper";
import type { Me } from "@/lib/get-user";

const allStepsCompletedStepPath = "/order/status";

export const OrderStepperWrapper = ({ user }: { user?: Me | null }) => {
  const { isMobile } = useViewport();

  const steps = [
    {
      title: "Verify ID",
      icon: <ScanSmiley />,
      urlPrefix: "/order/verify",
    },
    {
      title: "Order details",
      icon: <Basket />,
      urlPrefix: "/order/details",
    },
    {
      title: "Payment",
      icon: <Cardholder />,
      urlPrefix: "/order/deposit",
    },
    user?.country !== "BR" && {
      title: "Set PIN",
      icon: <LockKey />,
      urlPrefix: "/order/pin",
    },
  ].filter(Boolean) as Step[];

  const pathname = usePathname();

  const stepReached = pathname.startsWith(allStepsCompletedStepPath)
    ? steps.length + 1
    : steps.findIndex((step) => pathname.startsWith(step.urlPrefix)) + 1;

  return (
    <OrderStepper
      steps={steps}
      stepReached={stepReached}
      showStepNumber
      isMobile={isMobile}
    />
  );
};
