import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DesktopSupportButton } from "@/components/support/desktop-support-button";
import { SupportContactModal } from "@/components/support/support-contact-modal";
import { usePylonUser } from "@/hooks/usePylonUser";
import { hidePylonChat, hidePylonChatBubble, setPylonOnHide, setPylonOnShow, showPylonChat } from "@/utils/pylon";

type SupportContextValue = {
  open: () => void;
  close: () => void;
  isChatAvailable: boolean;
};

const SupportContext = createContext<SupportContextValue | undefined>(undefined);

export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const { isIdentified } = usePylonUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Support is opened from our own buttons, so Pylon's bubble stays hidden while the chat is
  // closed. Opening the chat brings it back as the collapse control and it cannot be hidden
  // then, so our floating button steps aside instead of overlapping it. Nothing is sent while
  // unidentified: the widget is not loaded then and the loader replays everything it buffered
  useEffect(() => {
    if (!isIdentified) {
      return;
    }

    hidePylonChatBubble();
    setPylonOnShow(() => setIsChatOpen(true));
    setPylonOnHide(() => {
      setIsChatOpen(false);
      hidePylonChatBubble();
    });

    return () => {
      setPylonOnShow(null);
      setPylonOnHide(null);
    };
  }, [isIdentified]);

  const open = useCallback(() => {
    if (!isIdentified) {
      setIsModalOpen(true);
      return;
    }

    showPylonChat();
  }, [isIdentified]);

  const close = useCallback(() => {
    hidePylonChat();
  }, []);

  const value = useMemo(
    () => ({
      open,
      close,
      isChatAvailable: isIdentified,
    }),
    [open, close, isIdentified],
  );

  return (
    <SupportContext.Provider value={value}>
      {children}
      {/* Desktop-only: mobile has its own support entry in the footer */}
      {!isChatOpen && <DesktopSupportButton onClick={open} />}
      <SupportContactModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </SupportContext.Provider>
  );
};

export const usePylon = () => {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error("usePylon() must be used within a SupportProvider");
  }
  return context;
};
