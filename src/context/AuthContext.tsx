import { getApiV1AuthNonce, postApiV1AuthChallenge } from "@/client";
import { client } from "@/client/client.gen";
import { CollapsedError } from "@/components/collapsedError";
import { isTokenExpired } from "@/utils/isTokenExpired";
import { isTokenWithUserId } from "@/utils/isTokenWithUserId";
import { differenceInMilliseconds, fromUnixTime } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SiweMessage } from "siwe";
import { toast } from "sonner";
import { useSignMessage, useAccount, useConnections } from "wagmi";
import { getAddress } from "viem";

export const LOCALSTORAGE_JWT_KEY = "gp-ui.jwt";

type AuthContextProps = {
  children: ReactNode | ReactNode[];
};

export type IAuthContext = {
  getJWT: () => Promise<string | undefined>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  jwtContainsUserId: boolean;
  updateJwt: (newJwt: string) => void;
  updateClient: (optionalJwt?: string) => void;
  showInitializingLoader: boolean;
  renewToken: () => Promise<string | undefined>;
};

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtContainsUserId, setJwtContainsUserId] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLocaStorageLoading, setIsLocaStorageLoading] = useState(true);
  const [contextKey, setContextKey] = useState(0);
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const connections = useConnections();
  const renewalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renewalInProgressRef = useRef(false);
  const previousAddressRef = useRef<string | undefined>(address);
  const jwtAddressKey = useMemo(() => {
    if (!address) return "";
    return `${LOCALSTORAGE_JWT_KEY}.${address}`;
  }, [address]);

  useEffect(() => {
    if (!jwt) {
      setJwtContainsUserId(false);
      return;
    }

    setJwtContainsUserId(isTokenWithUserId(jwt));
  }, [jwt]);

  useEffect(() => {
    if (!jwtAddressKey) {
      return;
    }

    // Reset loading state when address changes
    setIsLocaStorageLoading(true);

    const storedJwt = localStorage.getItem(jwtAddressKey);

    if (storedJwt) {
      setJwt(storedJwt);
    } else {
      // Clear JWT if no stored token for this address
      setJwt(null);
    }

    // Mark loading as complete after localStorage read
    setIsLocaStorageLoading(false);
  }, [jwtAddressKey]);

  // Handle app refresh when address changes
  useEffect(() => {
    const currentAddress = address;
    const previousAddress = previousAddressRef.current;

    // Skip on initial mount (when both are the same)
    if (previousAddress === currentAddress) {
      return;
    }

    // Skip if this is the first address being set (from undefined to an address)
    if (previousAddress === undefined && currentAddress) {
      previousAddressRef.current = currentAddress;
      return;
    }

    // Address changed from one valid address to another - remount context children
    if (previousAddress && currentAddress && previousAddress !== currentAddress) {
      previousAddressRef.current = currentAddress;
      setIsLocaStorageLoading(true);
      setContextKey((prev) => prev + 1); // Force remount of children
      return;
    }

    // Update the ref for other cases
    previousAddressRef.current = currentAddress;
  }, [address]);

  const isAuthenticated = useMemo(() => {
    const isExpired = isTokenExpired(jwt);

    return !!jwt && !isExpired && !isAuthenticating && !!address && !!chainId && connections.length > 0;
  }, [jwt, isAuthenticating, address, chainId, connections]);

  const showInitializingLoader = useMemo(() => {
    // Show loader while authenticating
    return isAuthenticating;
  }, [isAuthenticating]);

  const updateClient = useCallback(
    (optionalJwt?: string) => {
      const updatedJwt = optionalJwt || jwt;
      client.setConfig({
        headers: {
          Authorization: `Bearer ${updatedJwt}`,
        },
      });

      setIsAuthenticating(false);
    },
    [jwt],
  );

  useEffect(() => {
    if (!jwt) {
      return;
    }

    updateClient();
  }, [jwt, updateClient]);

  const updateJwt = useCallback(
    (newJwt: string) => {
      localStorage.setItem(jwtAddressKey, newJwt);
      setJwt(newJwt);
    },
    [jwtAddressKey],
  );

  const renewToken = useCallback(async () => {
    // If already authenticating, skip duplicate request
    if (renewalInProgressRef.current) {
      return;
    }

    if (!address || !chainId) {
      console.info("No address or chainId");
      return;
    }

    if (!jwtAddressKey) {
      console.info("No jwtAddressKey");
      return;
    }

    if (connections.length === 0) {
      console.info("No connections - wallet not connected yet");
      return;
    }

    renewalInProgressRef.current = true;

    try {
      setIsAuthenticating(true);
      const { data, error } = await getApiV1AuthNonce();

      if (error) {
        toast.error(<CollapsedError title="Error getting nonce" error={error} />);
        console.error(error);
        setIsAuthenticating(false);
        return;
      }

      if (!data) {
        console.error("No nonce returned");
        toast.error("No nonce returned");
        setIsAuthenticating(false);
        return;
      }

      // Ensure address is properly checksummed for EIP-55 compliance
      let checksummedAddress: string;
      try {
        checksummedAddress = getAddress(address);
      } catch (error) {
        console.error("Invalid address format:", address, error);
        toast.error("Invalid wallet address format");
        setIsAuthenticating(false);
        return;
      }

      const message = new SiweMessage({
        domain: "app.gnosispay.com",
        address: checksummedAddress,
        statement: "Sign in with Ethereum to the app.",
        uri: "https://app.gnosispay.com",
        version: "1",
        chainId,
        nonce: data,
      });

      const preparedMessage = message.prepareMessage();
      let signature = "";

      try {
        signature = await signMessageAsync({
          message: preparedMessage,
        });
      } catch (error) {
        console.error("Error signing message", error);
        setIsAuthenticating(false);
        return;
      }

      if (!signature) {
        console.error("No signature returned");
        setIsAuthenticating(false);
        return;
      }

      try {
        const { data, error } = await postApiV1AuthChallenge({
          body: {
            message: preparedMessage,
            signature,
          },
        });

        if (error) {
          toast.error(<CollapsedError title="Error validating message" error={error} />);
          console.error(error);
          setIsAuthenticating(false);
          return;
        }

        if (!data?.token) {
          console.error("No token returned");
          toast.error(<CollapsedError title="Error validating message" error={error} />);
          setIsAuthenticating(false);
          return;
        }

        updateJwt(data.token);
        return data.token;
      } catch (error) {
        console.error("Error validating message", error);
        toast.error(<CollapsedError title="Error validating message" error={error} />);
        setIsAuthenticating(false);
        return;
      }
    } catch (error) {
      console.error("Error renewing token", error);
      setIsAuthenticating(false);
      return;
    } finally {
      renewalInProgressRef.current = false;
    }
  }, [address, chainId, signMessageAsync, jwtAddressKey, updateJwt, connections]);

  // Set up automatic JWT renewal timeout, simpler approach than with an interceptor
  // see https://heyapi.dev/openapi-ts/clients/fetch#interceptors
  useEffect(() => {
    // Clear any existing timeout when setting up a new one
    if (renewalTimeoutRef.current) {
      clearTimeout(renewalTimeoutRef.current);
      renewalTimeoutRef.current = null;
    }

    // Only set up timeout if we have a valid JWT
    if (!jwt || isTokenExpired(jwt)) {
      return;
    }

    try {
      const decodedToken = jwtDecode(jwt);

      if (!decodedToken.exp) {
        return;
      }

      const expirationDate = fromUnixTime(decodedToken.exp);
      const currentDate = new Date();
      const timeUntilExpiry = differenceInMilliseconds(expirationDate, currentDate);

      // Set timeout to renew when token expires
      const timeoutDelay = Math.max(0, timeUntilExpiry);

      renewalTimeoutRef.current = setTimeout(() => {
        console.info("JWT renewal timeout triggered, renewing token...");
        renewToken();
      }, timeoutDelay);
    } catch (error) {
      console.error("Error setting up JWT renewal timeout:", error);
    }

    // Cleanup function to clear timeout when component unmounts or effect re-runs
    return () => {
      if (renewalTimeoutRef.current) {
        clearTimeout(renewalTimeoutRef.current);
        renewalTimeoutRef.current = null;
      }
    };
  }, [jwt, renewToken]);

  useEffect(() => {
    // Don't proceed until localStorage loading is complete
    if (isLocaStorageLoading) {
      return;
    }

    const expired = isTokenExpired(jwt);

    if (jwt !== null && !expired) {
      // token is valid, no need to renew
      return;
    }

    renewToken();
  }, [jwt, isLocaStorageLoading, renewToken]);

  const getJWT = useCallback(async () => {
    const expired = isTokenExpired(jwt);

    if (!jwt || expired) {
      return renewToken();
    }

    return jwt;
  }, [jwt, renewToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        getJWT,
        jwtContainsUserId,
        updateJwt,
        updateClient,
        showInitializingLoader,
        renewToken,
      }}
    >
      <div key={contextKey}>{children}</div>
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};

export { AuthContextProvider, useAuth };
