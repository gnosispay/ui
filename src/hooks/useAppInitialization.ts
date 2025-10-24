import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useAppKitAccount, useAppKitConnections } from "@reown/appkit/react";

export const useAppInitialization = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isConnected, status } = useAppKitAccount();
  const { connections } = useAppKitConnections();
  const isConnecting = useMemo(() => status === "connecting", [status]);
  const { isAuthenticated, showInitializingLoader: authShowsLoader } = useAuth();
  const { showInitializingLoader: userShowsLoader } = useUser();
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

    // If auth context needs to show loader (e.g., still authenticating)
    if (authShowsLoader) {
      return;
    }

    // If wallet is connected but not authenticated, we can show the login screen
    if (!isAuthenticated) {
      doneInitializing();
      return;
    }

    // If user context needs to show loader (e.g., loading user data, waiting for safe config)
    if (userShowsLoader) {
      return;
    }

    // Once we have all necessary data, we can determine the user's state and show appropriate screen
    doneInitializing();
  }, [isConnecting, isConnected, connections, authShowsLoader, isAuthenticated, userShowsLoader, doneInitializing]);

  return { isInitializing };
};
