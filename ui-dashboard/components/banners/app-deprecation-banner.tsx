"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import Button from "@/components/buttons/buttonv2";
import { XIcon } from "@phosphor-icons/react";
import {
  isTomorrow,
  isToday,
  formatDistanceToNow,
  format,
  addDays,
  subDays,
  addMonths
} from "date-fns";

import { differenceInMilliseconds, addMilliseconds } from "date-fns";

function midpoint(date1: Date, date2: Date): Date {
  const diff = differenceInMilliseconds(date2, date1);
  return addMilliseconds(date1, diff / 2);
}

function readableInterval(date: Date) {
  if (isToday(date)) return "today";
  if (isTomorrow(date)) return "tomorrow";

  return formatDistanceToNow(date, { addSuffix: true });
}

const START_DATE = new Date("2025-09-30");
const DEPRECATION_DATE = new Date(
  process.env.NEXT_PUBLIC_APP_DEPRECATION_END_DATE || "2025-10-15",
);
const DELETION_DATE = addMonths(DEPRECATION_DATE, 1);

type DeprecationPhase = 1 | 2 | 3 | 4;

interface PhaseConfig {
  headline: string;
  body: string;
  cta: string;
  backgroundColor: string;
  textColor: string;
  isDismissible: boolean;
}

const PHASE_CONFIGS: Record<DeprecationPhase, PhaseConfig> = {
  1: {
    headline: "Your experience is getting an upgrade!",
    body: "Discover our new, faster app. We've moved everything over for you.",
    cta: "Explore the New App",
    backgroundColor: "bg-amber-100",
    textColor: "text-yellow-900",
    isDismissible: true,
  },
  2: {
    headline: "This app is retiring soon.",
    body: `We're moving everyone to the new app on ${format(DEPRECATION_DATE, 'MMMM d, yyyy')}. Switch now to get used to the new features.`,
    cta: "Go to the New App",
    backgroundColor: "bg-red-100",
    textColor: "text-red-900",
    isDismissible: false,
  },
  3: {
    headline: `FINAL NOTICE: This app retires ${readableInterval(DEPRECATION_DATE)}.`,
    body: `To continue using our service and access your data, you must use the new app. After ${format(DEPRECATION_DATE, 'MMMM d')} all users will be redirected automatically to the new app.`,
    cta: "Switch to the New App (Mandatory)",
    backgroundColor: "bg-red-100",
    textColor: "text-red-900",
    isDismissible: false,
  },
  4: {
    headline: "This app was retired.",
    body: `To continue using our service and access your data, you must use the new app. This app will be deleted in ${format(DELETION_DATE, 'MMMM d, yyyy')}.`,
    cta: "Switch to the New App",
    backgroundColor: "bg-red-100",
    textColor: "text-red-900",
    isDismissible: false,
  },
};


export const AppDeprecationBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<DeprecationPhase | null>(
    null,
  );

  useEffect(() => {
    const now = new Date();
    const phase3Date = subDays(DEPRECATION_DATE, 3);
    const phase2Date = midpoint(phase3Date, START_DATE);

    
    if (now > DEPRECATION_DATE) {
      setCurrentPhase(4);
    } else if (now > phase3Date) {
      setCurrentPhase(3);
    } else if (now > phase2Date) {
      setCurrentPhase(2);
    } else if (now > START_DATE) {
      setCurrentPhase(1);
    } else {
      setCurrentPhase(null);
    }

  }, []);

  const handleDismiss = () => {
    if (currentPhase === 1) {
      setIsDismissed(true);
    }
  };

  if (!currentPhase || isDismissed) {
    return null;
  }

  const config = PHASE_CONFIGS[currentPhase];
  const newAppUrl =
    process.env.NEXT_PUBLIC_NEW_APP_URL || "https://app.gnosispay.com";

  return (
    <>
      <div
        className="relative top-0 left-0 right-0 z-50 shadow-md w-full"
      >
        <div
          className={`${config.backgroundColor} w-full p-4 flex gap-3 items-start`}
        >
          <div className="flex-1 max-w-6xl mx-auto flex gap-3 items-start px-4">
            <div className="flex-1">
              <h2
                className={`flex items-center justify-start ${config.textColor} font-semibold text-sm lg:text-base`}
              >
                {config.headline}
              </h2>
              <div
                className={`${config.textColor.replace("-900", "-700")} mt-1 text-xs lg:text-sm leading-tight`}
              >
                {config.body}
              </div>
              <Link href={newAppUrl} target="_blank" rel="noopener noreferrer">
                <Button className="mt-2 text-xs lg:text-sm py-1 px-3 lg:py-2 lg:px-4">
                  {config.cta}
                </Button>
              </Link>
            </div>

            {config.isDismissible && (
              <button
                onClick={handleDismiss}
                className={`${config.textColor} hover:opacity-70 transition-opacity p-1 flex-shrink-0`}
                aria-label="Dismiss banner"
              >
                <XIcon size={16} className="lg:hidden" />
                <XIcon size={20} className="hidden lg:block" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
