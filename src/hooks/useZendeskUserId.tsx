import { ZENDESK_PARTNER_TAG_VALUE, ZENDESK_USER_ID_FIELD_ID } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useZendesk } from "react-use-zendesk";

export const useZendeskUserId = () => {
  const { user } = useUser();
  const { isOpen, setConversationFields, setConversationTags, hide } = useZendesk();
  const [isFielsdSet, setIsFielsdSet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Hide widget on mobile by default
  useEffect(() => {
    const hideOnMobile = () => {
      if (isMobile && !isOpen) {
        hide();
      }
    };

    // Hide widget on mobile by default
    hideOnMobile();

    // hide widget after 1 second
    // because it's lazy loaded
    const timer = setTimeout(() => {
      hideOnMobile();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMobile, hide, isOpen]);

  // Set user ID and tags when widget is opened
  useEffect(() => {
    if (!isOpen || isFielsdSet) {
      return;
    }

    if (user?.id) {
      setConversationFields([{ id: ZENDESK_USER_ID_FIELD_ID, value: user.id }]);
    }

    setConversationTags([ZENDESK_PARTNER_TAG_VALUE]);
    setIsFielsdSet(true);
  }, [user?.id, isOpen, isFielsdSet, setConversationFields, setConversationTags]);
};
