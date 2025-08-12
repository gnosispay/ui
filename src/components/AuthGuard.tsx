import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/context/ThemeContext";
import { useCallback } from "react";
import type { ReactNode } from "react";
import darkOwl from "@/assets/Gnosis-owl-white.svg";
import lightOwl from "@/assets/Gnosis-owl-black.svg";

interface AuthGuardProps {
  children: ReactNode;
  checkForSignup?: boolean;
}

export const AuthGuard = ({ children, checkForSignup }: AuthGuardProps) => {
  const { isAuthenticating, isAuthenticated } = useAuth();
  const { isUserSignedUp, isKycApproved, isSafeConfigured } = useUser();
  const { effectiveTheme } = useTheme();
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();

  const handleConnect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  if (checkForSignup && isAuthenticated && (!isUserSignedUp || !isKycApproved || !isSafeConfigured))
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center space-y-6 max-w-md w-full">
          <img src={effectiveTheme === "dark" ? darkOwl : lightOwl} alt="Gnosis Pay" className="w-10 h-10" />

          <h1 className="text-2xl font-semibold text-foreground">Welcome to Gnosis Pay</h1>

          <p className="text-muted-foreground text-center">You need to complete the signup process to use the app.</p>

          <Button
            onClick={() => navigate("/register")}
            className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium py-3"
          >
            Complete Signup
          </Button>
        </div>
      </div>
    );

  if (!isAuthenticated)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center space-y-6 max-w-md w-full">
          <img src={effectiveTheme === "dark" ? darkOwl : lightOwl} alt="Gnosis Pay" className="w-10 h-10" />

          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>

          <p className="text-muted-foreground text-center">
            {isAuthenticating ? "Please connect your wallet to sign in" : "Please sign the message request."}
          </p>

          <Button
            disabled={isAuthenticating}
            loading={isAuthenticating}
            onClick={handleConnect}
            className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium py-3"
          >
            Connect
          </Button>
        </div>
      </div>
    );

  return <>{children}</>;
};
