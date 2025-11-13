"use client";

import { useLayoutEffect, useState } from "react";
import { useZendesk } from "@/hooks/use-zendesk";

export const ZendeskInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const { onZendeskChatOpen, setConversationTagsAndFields } = useZendesk();

  useLayoutEffect(() => {
    if (
      process.env.NEXT_PUBLIC_ZENDESK_KEY &&
      typeof window !== 'undefined' &&
      'zE' in window &&
      typeof (window as any).zE === 'function' &&
      !initialized
    ) {
      onZendeskChatOpen(setConversationTagsAndFields);
      setInitialized(true);
    }
  }, [onZendeskChatOpen, setConversationTagsAndFields, initialized]);

  // This component doesn't render anything, it just handles initialization
  return null;
};
