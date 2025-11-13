"use server";

import { fetchApi } from "@/lib/api";
import { cookies as nextCookies } from "next/headers";
import type { KycUserResponse } from "@/app/order/verify/kyc/types";
import type {
  CardOrder,
  KYCVerificationConsolidatedStatus,
  TokenSymbol,
} from "@gnosispay/prisma/client";

export type UserEndpointResponse = {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  nationalityCountry?: string;
  signInWallets: Array<{ address: string }>;
  safeWallets: Array<{
    address: string;
    chainId: string;
    tokenSymbol: TokenSymbol;
    createdAt: string;
  }>;
  kycStatus: KYCVerificationConsolidatedStatus;
  availableFeatures: {
    moneriumIban: boolean;
  };
  cards: Array<{
    id: string;
    cardToken: string;
    lastFourDigits: string;
    embossedName: string;
    activatedAt: string | null;
    virtual: boolean;
  }>;
  bankingDetails: {
    moneriumIban: string;
    moneriumBic: string;
    moneriumIbanStatus: string;
    address: string;
  } | null;
  isSourceOfFundsAnswered: boolean;
  isPhoneValidated: boolean;
};

export type SourceOfFundsEndpointResponse = Array<{
  question: string;
  answers: string[];
}>;

export type UserData = UserEndpointResponse & {
  accounts: Array<{
    address: string;
    type: string;
    chainId?: string;
    tokenSymbol?: TokenSymbol;
    createdAt?: string;
  }>;
  cardOrders: CardOrder[];
  hasAccess: boolean;
  phoneVerified: boolean;
  kycProvider?: KycUserResponse;
  verifiedEOA: Array<{ address: string }>;
  name?: string;
  sourceOfFunds?: SourceOfFundsEndpointResponse;
  BankingDetails?: {
    moneriumIban: string;
    moneriumBic: string;
    moneriumIbanStatus: string;
  };
};

export const getUser = async (
  cookies?: () => ReturnType<typeof nextCookies>,
): Promise<UserData | null> => {
  try {
    let actualCookies = cookies || nextCookies;
    const [
      userResponse,
      ordersResponse,
      kycUserResponse,
      sourceOfFundsResponse,
    ] = await Promise.all([
      fetchApi<UserEndpointResponse>(`/user`, { cookies: actualCookies }),
      fetchApi<CardOrder[]>(`/order`, { cookies: actualCookies }),
      fetchApi<KycUserResponse>(`/kyc/status`, { cookies: actualCookies }),
      fetchApi<SourceOfFundsEndpointResponse>(`/source-of-funds`, {
        cookies: actualCookies,
      }),
    ]);

    const userData = userResponse.data;
    const cardOrders = ordersResponse.data;
    const kycUser = kycUserResponse.data || undefined;
    const sourceOfFunds = sourceOfFundsResponse.data || undefined;

    if (!userData) {
      return null;
    }

    const accounts = [
      ...userData.safeWallets.map((acc: any) => ({ ...acc, type: "L1SAFE" })),
      ...userData.signInWallets.map((acc: any) => ({ ...acc, type: "EOA" })),
    ];

    const me: UserData = {
      ...userData,
      accounts,
      cardOrders: cardOrders || [],
      hasAccess: true, // Was hardcoded in original /me endpoint
      kycProvider: kycUser,
      name:
        userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : userData.firstName || userData.lastName,
      phoneVerified: userData.isPhoneValidated,
      sourceOfFunds: sourceOfFunds,
      verifiedEOA: userData.signInWallets,
      BankingDetails: userData.bankingDetails
        ? {
            moneriumIban: userData.bankingDetails.moneriumIban,
            moneriumBic: userData.bankingDetails.moneriumBic,
            moneriumIbanStatus: userData.bankingDetails.moneriumIbanStatus,
          }
        : undefined,
    };

    return me;
  } catch (error) {
    console.error("Error fetching user data", error);
    return null;
  }
};

export { getUser as default };
