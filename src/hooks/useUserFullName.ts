import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

export const useUserFullName = () => {
  const { user } = useUser();

  const fullName = useMemo(() => {
    return user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "";
  }, [user?.firstName, user?.lastName]);

  return fullName;
};
