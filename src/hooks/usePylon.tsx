import { useCallback } from "react";
import { hidePylonChat, hidePylonChatBubble, showPylonChat, showPylonChatBubble } from "@/utils/pylon";

export const usePylon = () => {
  // The bubble is hidden on mobile, so it has to be shown again before opening the chat
  const open = useCallback(() => {
    showPylonChatBubble();
    showPylonChat();
  }, []);

  const close = useCallback(() => {
    hidePylonChat();
  }, []);

  const showBubble = useCallback(() => {
    showPylonChatBubble();
  }, []);

  const hideBubble = useCallback(() => {
    hidePylonChatBubble();
  }, []);

  return { open, close, showBubble, hideBubble };
};
