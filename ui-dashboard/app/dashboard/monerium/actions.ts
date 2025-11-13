import { fetchApi } from "@/lib/api";

export const resetMoneriumData = async () => {
  return fetchApi(`/ibans/reset`, {
    method: "DELETE",
  });
};
