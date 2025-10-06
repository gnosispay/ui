import { useEffect, useState, useRef, useCallback } from "react";
import { useAccount, useConnections } from "wagmi";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

export const useAppInitialization = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isConnected, isConnecting } = useAccount();
  const connections = useConnections();
  const { isAuthenticated, isAuthenticating } = useAuth();
  const { user, safeConfig, isUserSignedUp } = useUser();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedInitialCheck = useRef(false);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const doneInitializing = useCallback(() => {
    setIsInitializing(false);
    hasCompletedInitialCheck.current = true;
    clearTimeoutRef();
  }, [clearTimeoutRef]);

  useEffect(() => {
    // Set up a fallback timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.warn("App initialization timeout reached, forcing initialization to complete");
      doneInitializing();
    }, 5000); // 5 second timeout

    return () => {
      clearTimeoutRef();
    };
  }, [clearTimeoutRef, doneInitializing]);

  useEffect(() => {
    // Don't proceed if we've already completed the initial check
    if (hasCompletedInitialCheck.current) {
      return;
    }

    // Wait for wallet connection state to stabilize
    if (isConnecting) {
      return;
    }

    // If wallet is not connected, we can show the connect screen
    if (!isConnected) {
      doneInitializing();
      return;
    }

    // If wallet is connected, wait for connections to be established
    if (isConnected && connections.length === 0) {
      return;
    }

    // If wallet is connected but we're still authenticating, wait
    if (isAuthenticating) {
      return;
    }

    // If wallet is connected but not authenticated, we can show the login screen
    if (!isAuthenticated) {
      doneInitializing();
      return;
    }

    // If authenticated but JWT doesn't contain user ID, we can show signup screen
    if (!isUserSignedUp) {
      doneInitializing();
      return;
    }

    // If authenticated and JWT contains user ID, wait for user data to load
    if (user === undefined) {
      return;
    }

    // For KYC approved users, also wait for safe config to determine full onboarding status
    if (user.kycStatus === "approved" && safeConfig === undefined) {
      return;
    }

    // Once we have all necessary data, we can determine the user's state and show appropriate screen
    doneInitializing();
  }, [
    isConnecting,
    isConnected,
    connections,
    isAuthenticating,
    isAuthenticated,
    isUserSignedUp,
    user,
    safeConfig,
    doneInitializing,
  ]);

  return { isInitializing };
};
