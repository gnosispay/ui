import { fetchApi } from "@/lib/api";

const getMoneriumCallbackUrl = (): string => {
  return typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/monerium`
    : "";
};

export const setupMoneriumProfile = async ({
  signature,
}: { signature: string }) => {
  const callbackUrl = getMoneriumCallbackUrl();

  return fetchApi(`/ibans/monerium-profile`, {
    method: "POST",
    body: {
      callbackUrl,
      signature,
    },
  });
};

export const getMoneriumRedirectUrl = async () => {
  const callbackUrl = encodeURIComponent(getMoneriumCallbackUrl());
  return fetchApi(`/ibans/oauth/redirect_url?callbackUrl=${callbackUrl}`);
};
