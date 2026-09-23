import { PYLON_SAFE_ADDRESS_FIELD_SLUG } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { usePylonUser } from "@/hooks/usePylonUser";
import { setPylonChatSettings, setPylonCustomFields, setPylonTheme } from "@/utils/pylon";
import { useEffect } from "react";

export const usePylonIdentity = () => {
  const { effectiveTheme } = useTheme();
  const { safeConfig } = useUser();
  const { email, name, isIdentified } = usePylonUser();
  const safeAddress = safeConfig?.address;

  // The loader boots the widget as soon as it sees the settings, so they are only
  // published once Pylon has everything it needs to render
  useEffect(() => {
    if (!isIdentified) {
      return;
    }

    setPylonChatSettings({ email, name });
  }, [email, name, isIdentified]);

  useEffect(() => {
    if (!safeAddress) {
      return;
    }

    setPylonCustomFields({ [PYLON_SAFE_ADDRESS_FIELD_SLUG]: safeAddress });
  }, [safeAddress]);

  useEffect(() => {
    setPylonTheme(effectiveTheme === "dark" ? "dark" : "light");
  }, [effectiveTheme]);
};
