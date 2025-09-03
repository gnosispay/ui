"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import type { Me } from "@/lib/get-user";

export const useUser = () => {
  return useQuery<Me>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data } = await fetchApi<Me>("/me");
        if (!data) {
          throw new Error("User data not found");
        }
        return data;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch user");
      }
    },
  });
};

export default useUser;
