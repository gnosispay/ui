import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/context/ThemeContext";
import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import darkOwl from "@/assets/Gnosis-owl-white.svg";
import lightOwl from "@/assets/Gnosis-owl-black.svg";
import { useAccount } from "wagmi";

interface AuthGuardProps {
  children: ReactNode;
  checkForSignup?: boolean;
}

interface AuthScreenProps {
  title: string;
  description: string;
  buttonText: string;
  buttonProps: {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

const AuthScreen = ({ title, description, buttonText, buttonProps }: AuthScreenProps) => {
  const { effectiveTheme } = useTheme();

  const logoSrc = useMemo(() => (effectiveTheme === "dark" ? darkOwl : lightOwl), [effectiveTheme]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md w-full">
        <img src={logoSrc} alt="Gnosis Pay" className="w-10 h-10" />
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-center">{description}</p>
        <Button
          {...buttonProps}
          className="w-full bg-button-bg hover:bg-button-bg-hover text-button-black font-medium py-3"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export const AuthGuard = ({ children, checkForSignup }: AuthGuardProps) => {
  const { isAuthenticating, isAuthenticated } = useAuth();
  const { isUserSignedUp, isKycApproved, isSafeConfigured } = useUser();
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const { isConnected, isConnecting } = useAccount();

  const handleConnect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const handleNavigateToRegister = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  const signupScreenConfig = useMemo(
    (): AuthScreenProps => ({
      title: "Welcome to Gnosis Pay",
      description: "You need to complete the signup process to use the app.",
      buttonText: "Complete Signup",
      buttonProps: {
        onClick: handleNavigateToRegister,
      },
    }),
    [handleNavigateToRegister],
  );

  const loginScreenConfig = useMemo((): AuthScreenProps => {
    const buttonText = isAuthenticating ? "Signing message..." : "Sign message";
    return {
      title: "Login",
      description: "Please sign the message request to login.",
      buttonText,
      buttonProps: {
        onClick: handleConnect,
        disabled: isAuthenticating,
        loading: isAuthenticating,
      },
    };
  }, [handleConnect, isAuthenticating]);

  const connectionScreenConfig = useMemo((): AuthScreenProps => {
    const buttonText = isConnecting ? "Connecting..." : "Connect wallet";

    return {
      title: "Connect your wallet",
      description: "Please connect your wallet to continue.",
      buttonText,
      buttonProps: { onClick: handleConnect, disabled: isConnecting, loading: isConnecting },
    };
  }, [handleConnect, isConnecting]);

  const needsSignup = checkForSignup && isAuthenticated && (!isUserSignedUp || !isKycApproved || !isSafeConfigured);

  // this is purely related to the wallet
  if (!isConnected) {
    return <AuthScreen {...connectionScreenConfig} />;
  }

  // the wallet is connected but the JWT is not set or expired
  if (!isAuthenticated) {
    return <AuthScreen {...loginScreenConfig} />;
  }

  // the wallet is connected and the JWT is set but the user needs to sign up
  if (needsSignup) {
    return <AuthScreen {...signupScreenConfig} />;
  }

  return <>{children}</>;
};
