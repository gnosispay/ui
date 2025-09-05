import { useUser } from "@/context/UserContext";
import { useUserFullName } from "@/hooks/useUserFullName";
import { useMemo } from "react";

export const UserProfileHeader = () => {
  const { user } = useUser();
  const fullName = useUserFullName();

  const userInitials = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return "UN";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }, [user]);

  const userDisplayName = useMemo(() => {
    return fullName || "Unknown User";
  }, [fullName]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-icon-background flex items-center justify-center text-2xl font-semibold text-primary">
        {userInitials}
      </div>
      <h1 className="text-2xl font-semibold text-foreground text-center">{userDisplayName}</h1>
    </div>
  );
};
