"use client";

import { useState } from "react";

import { Warning } from "@phosphor-icons/react/dist/ssr";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useSafeIntercom } from "@/hooks/use-safe-intercom";

// iteration on the original button minus the loading state
// if you're hesitating which button to use, use this one and implement the loading state at the component level
import { createKytIntercomTicket } from "@/lib/create-kyt-intercom-ticket";
import { useZendesk } from "@/hooks/use-zendesk";
import Button from "../../../components/buttons/buttonv2";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const SecondaryButton = (props: ButtonProps) => {
  const { children, className, ...rest } = props;
  return (
    <button
      className={twMerge(
        "px-4 py-2  text-gray-800 flex rounded-xl items-center justify-center gap-2 focus:outline-none focus:border-gray-300 cursor-pointer disabled:cursor-default disabled:bg-gray-400 disabled:text-gray-600 border border-gp-border bg-gp-bg-app ",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

const CardBalanceWarning = () => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { show: openIntercomChat } = useSafeIntercom();

  const { openZendeskChat } = useZendesk();

  const isZendeskEnabled = useFeatureFlagEnabled(
    "zendesk-instead-of-intercom-enabled",
  );

  const posthogFeatureFlagsInitialized =
    typeof isZendeskEnabled !== "undefined";

  if (!posthogFeatureFlagsInitialized) {
    return null;
  }

  const contactSupport = async () => {
    setSubmitting(true);

    try {
      await createKytIntercomTicket();
      if (isZendeskEnabled) {
        openZendeskChat();
      } else {
        openIntercomChat();
      }
    } catch (error) {
      console.log(error);
    }

    setSubmitting(false);
  };

  return (
    <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 mt-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>

        <div className="ml-3">
          <h3 className="text-md font-medium text-stone-900">
            Card-ready balance?
          </h3>

          <div className="mt-2 text-md text-stone-900">
            <p>
              A deposit into your account did not pass a validation check and
              will not be spendable on the Visa network. Your total balance
              remains available for on-chain transactions.
            </p>
          </div>
          <div className="mt-2 text-md text-stone-900 flex gap-3">
            <Link href="/dashboard/account-status">
              <SecondaryButton className="text-stone-900 text-sm">
                Learn more
              </SecondaryButton>
            </Link>

            <Button onClick={contactSupport} disabled={submitting}>
              {submitting ? "Submitting..." : "Contact support"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardBalanceWarning;
