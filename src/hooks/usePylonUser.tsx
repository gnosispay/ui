import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

/**
 * Pylon refuses to render the chat widget and drops every `window.Pylon` command
 * unless chat_settings carries an app id, an email and a name.
 */
export const usePylonUser = () => {
  const { user } = useUser();

  return useMemo(() => {
    const email = user?.email ?? undefined;
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    // Names only come in with the KYC data, so fall back to the email for earlier stages
    const name = fullName || email?.split("@")[0];

    return { email, name, isIdentified: Boolean(email && name) };
  }, [user?.email, user?.firstName, user?.lastName]);
};
