import { fetchApi } from "@/lib/api";

export interface BankDetailsResponse {
  data: {
    iban: string | null;
    bic: string | null;
    ibanStatus: string | null;
  };
}
export const getBankDetails = async (): Promise<BankDetailsResponse | null> => {
  const { data } = await fetchApi(`/ibans/details`);
  return data;
};
