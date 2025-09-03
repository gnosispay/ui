import { fetchApi } from "@/lib/api";
import type { cookies as nextCookies } from "next/headers";

const intercomEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERCOM === "true";

export const getIntercomUserHash = async (
  cookies?: () => ReturnType<typeof nextCookies>,
) => {
  if (!cookies || !intercomEnabled) {
    return null;
  }

  try {
    const { data } = await fetchApi("/intercom/user-hash", { cookies });

    if (!data) {
      return null;
    }

    const { hash } = data;

    return hash;
  } catch (error) {
    console.log("Error occurred while initializing Intercom", { error });
    return null;
  }
};
