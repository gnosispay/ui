import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";
import type { KycUserResponse } from "./types";

export const getKycUser = async (): Promise<KycUserResponse | null> => {
  try {
    const { data } = await fetchApi(`/kyc/status`, { cookies });
    return data;
  } catch (e) {
    return null;
  }
};

export const getKYCApprovals = async (): Promise<{
  approved: boolean;
  processingStatus: string;
  verificationStatus: string;
} | null> => {
  try {
    const { data } = await fetchApi(`/kyc/approvals`, { cookies });
    return data;
  } catch (e) {
    return null;
  }
};
