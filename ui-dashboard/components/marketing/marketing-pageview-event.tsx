"use client";

/**
 * Component used for triggering custom events from the top-level Next.js pages.
 *
 * Those pages are often Server Components so we needed a way to trigger marketing
 * events (usually custom page views) from them, and hence we render this component in those
 * cases.
 *
 * This component doesn't affect UI in any way.
 */

import { useEffect, useRef } from "react";

import { triggerEvent as triggerGTMEvent } from "@/lib/gtm";
import type { GTMEvent } from "@/lib/gtm";

interface MarketingPageviewEventProps {
  event: GTMEvent;
}
const MarketingPageviewEvent = ({ event }: MarketingPageviewEventProps) => {
  const eventTriggered = useRef(false);

  useEffect(() => {
    // Make sure specified event is triggered only once
    if (!eventTriggered.current) {
      triggerGTMEvent(event);
      eventTriggered.current = true;
    }
  }, [event]);

  return null;
};

export default MarketingPageviewEvent;
