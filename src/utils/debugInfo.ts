import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import type { SafeConfig, User } from "@/client";

export interface DebugInfo {
  isAuthenticated: boolean;
  isUserSignedUp: boolean;
  isKycApproved?: boolean;
  isSafeConfigured?: boolean;
  safeConfig: SafeConfig | undefined;
  user: User | undefined;
}

export const useDebugInfo = (): DebugInfo => {
  const { isAuthenticated } = useAuth();
  const { user, safeConfig, isUserSignedUp, isKycApproved, isSafeConfigured } = useUser();

  return {
    isAuthenticated,
    isUserSignedUp: isUserSignedUp ?? false,
    isKycApproved,
    isSafeConfigured,
    safeConfig,
    user,
  };
};

export const formatDebugInfo = (debugInfo: DebugInfo): string => {
  return `=== Gnosis Pay Debug Information ===
isAuthenticated: ${debugInfo.isAuthenticated}
isUserSignedUp: ${debugInfo.isUserSignedUp}
isKycApproved: ${debugInfo.isKycApproved}
isSafeConfigured: ${debugInfo.isSafeConfigured}

=== Safe Config ===
${JSON.stringify(debugInfo.safeConfig, null, 2)}

=== User ===
${JSON.stringify(debugInfo.user, null, 2)}`;
};
