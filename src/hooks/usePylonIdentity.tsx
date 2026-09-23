import { PYLON_PARTNER_FIELD_SLUG, PYLON_PARTNER_FIELD_VALUE, PYLON_USER_ID_FIELD_SLUG } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import {
  hidePylonChatBubble,
  setPylonChatSettings,
  setPylonNewIssueCustomFields,
  setPylonOnHide,
  setPylonTheme,
  showPylonChatBubble,
} from "@/utils/pylon";
import { useEffect, useMemo, useState } from "react";

export const usePylonIdentity = () => {
  const { user } = useUser();
  const { effectiveTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  const fullName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    [user?.firstName, user?.lastName],
  );

  const customFields = useMemo(() => {
    const fields: Record<string, string> = { [PYLON_PARTNER_FIELD_SLUG]: PYLON_PARTNER_FIELD_VALUE };

    if (user?.id) {
      fields[PYLON_USER_ID_FIELD_SLUG] = user.id;
    }

    return fields;
  }, [user?.id]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // The footer has its own support button on mobile, so the bubble would be redundant there
  useEffect(() => {
    if (!isMobile) {
      showPylonChatBubble();
      return;
    }

    // Opening the chat brings the bubble back, so it has to be hidden again on close
    hidePylonChatBubble();
    setPylonOnHide(hidePylonChatBubble);

    return () => setPylonOnHide(null);
  }, [isMobile]);

  useEffect(() => {
    setPylonChatSettings({
      email: user?.email ?? undefined,
      name: fullName || undefined,
    });
  }, [user?.email, fullName]);

  useEffect(() => {
    setPylonNewIssueCustomFields(customFields);
  }, [customFields]);

  useEffect(() => {
    setPylonTheme(effectiveTheme === "dark" ? "dark" : "light");
  }, [effectiveTheme]);
};
