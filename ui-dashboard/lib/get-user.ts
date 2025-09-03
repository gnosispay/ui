import { fetchApi } from "@/lib/api";
import type { cookies as nextCookies } from "next/headers";

export type Me = {
  accounts: Array<any>; // Replace 'any' with a more specific type if known
  address1: string;
  address2: string;
  cardOrders: Array<any>; // Replace 'any' with a more specific type if known
  cards: Array<any>; // Replace 'any' with a more specific type if known
  city: string;
  country: string;
  createdAt: string;
  hasAccess: boolean;
  hasSignedUp: boolean;
  id: string;
  kycProviders: Array<any>; // Replace 'any' with a more specific type if known
  name: string;
  paymentologyCustomerId: null | string;
  phone: string;
  phoneVerified: boolean;
  postalCode: string;
  sourceOfFunds: Array<any>; // Replace 'any' with a more specific type if known
  state: null | string;
  updatedAt: string;
  verifiedEOA: Array<any>; // Replace 'any' with a more specific type if known
  email: string;
  firstName: string;
  lastName: string;
  BankingDetails?: {
    moneriumIban: string;
    moneriumBic: string;
    moneriumIbanStatus: string;
  };
};

export const getUser = async (
  cookies?: () => ReturnType<typeof nextCookies>,
) => {
  try {
    const { data } = await fetchApi<Me>(`/me`, { cookies });
    return data;
  } catch (error) {
    console.error("Error fetching user /me", error);
    return null;
  }
};

export default getUser;
