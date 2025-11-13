"use client";

import { useEffect, useState } from "react";
import { ScanSmiley, Basket, Cardholder } from "@phosphor-icons/react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { signOut } from "next-auth/react";
import Button from "../../../components/buttons/button";
import { OrderStepper } from "../../../components/order-stepper";
import {
  GNOSIS_PAY_PRIVACY_POLICY_URL,
  GNOSIS_PAY_TOS_URL,
} from "../../../lib/constants";
import { TitleSubtitle } from "../../../components/layout/title-subtitle";
import { classNames } from "../../../lib/utils";

const steps = [
  {
    title: "Verify ID",
    description: "Verify your identity",
    icon: <ScanSmiley />,
    urlPrefix: "/order/verify",
  },
  {
    title: "Order details",
    description: "Confirm your card and shipping details",
    icon: <Basket />,
    urlPrefix: "/order/details",
  },
  {
    title: "Checkout",
    description: `Complete your card order`,
    icon: <Cardholder />,
    urlPrefix: "/order/deposit",
  },
  // {
  //   title: "Set PIN",
  //   description: "Set a new 4-digit card PIN",
  //   icon: <LockKey />,
  // },
];

const WelcomeForm = () => {
  const [checkedTC, setCheckedTC] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    if (checkedTC) {
      posthog?.capture("signup:kyc:agree_to_terms");
    }
  }, [checkedTC, posthog]);

  const kycPath = "/order/verify/kyc/sumsub";

  return (
    <div className="flex flex-1">
      <div className="flex mx-12 relative z-20 flex-1 items-center">
        <div className="flex flex-col flex-1 space-y-8">
          <TitleSubtitle
            title="👋 Welcome"
            subtitle="Your Gnosis Card is only a few steps away"
          />
          <div className="space-y-16">
            <OrderStepper steps={steps} stepReached={0} />
            <label className="flex w-full gap-4 rounded-xl bg-white-800 sm:flex-row">
              <input
                type="checkbox"
                checked={checkedTC}
                onChange={() => setCheckedTC(!checkedTC)}
                name="terms"
                className="rounded-md border-low-contrast w-6 h-6"
              />
              <div className="text-left text-base text-primary space-y-2">
                <p>Click here to confirm you have read and accept the: </p>
                <div>
                  <Link
                    href={GNOSIS_PAY_TOS_URL}
                    className="text-sm text-secondary underline block"
                    target="_blank"
                    referrerPolicy="no-referrer"
                  >
                    Gnosis Pay WebApp Terms of Service
                  </Link>
                  <Link
                    href={GNOSIS_PAY_PRIVACY_POLICY_URL}
                    className="text-sm text-secondary underline block"
                    target="_blank"
                    referrerPolicy="no-referrer"
                  >
                    Gnosis Pay Privacy and Cookies Policy
                  </Link>
                </div>
              </div>
            </label>
            <div className="space-y-4 flex-1 flex items-center flex-col">
              <Link
                href={kycPath}
                className={classNames(
                  "w-full",
                  !checkedTC && "pointer-events-none",
                )}
              >
                <Button className="py-3 flex-1 w-full" disabled={!checkedTC}>
                  Get started
                </Button>
              </Link>
              <Button
                className="w-full bg-white text-stone-900 border-stone-900 border focus:border-stone-900 py-3"
                onClick={() => {
                  signOut();
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeForm;
