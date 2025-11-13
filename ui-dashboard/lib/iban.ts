import { fetchApi } from "./api";
import type { cookies as nextCookies } from "next/headers";


export const isIbanAvailable = async (
  cookies?: () => ReturnType<typeof nextCookies>,
) => {
  try {
    const {
      data: {
        data: { available: ibanAvailable },
      },
    } = await fetchApi(`/ibans/available`, { cookies });

    return ibanAvailable;
  } catch (error) {
    console.error('Error checking IBAN availability:', error);
    return false;
  }
};
