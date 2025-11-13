"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser, type UserData } from "@/lib/get-user";

export const useUser = () => {
  return useQuery<UserData | null>({
    queryKey: ["user"],
    queryFn: async () => {
      return await getUser();
    },
  });
};

export default useUser;
