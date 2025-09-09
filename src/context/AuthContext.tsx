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
import { useAccount, useConnections, useSignMessage } from "wagmi";

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
  renewJWT: () => Promise<string | undefined>;
};

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtContainsUserId, setJwtContainsUserId] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isConnected, address, chainId, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const connections = useConnections();
  const renewalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renewalPromiseRef = useRef<Promise<string | undefined> | null>(null);
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
    // Clear any pending renewal when address changes to prevent stale operations
    renewalPromiseRef.current = null;

    if (!jwtAddressKey) {
      return;
    }

    console.log("--> connector", connector);
    console.log("--> new key", jwtAddressKey);

    const storedJwt = localStorage.getItem(jwtAddressKey);

    if (storedJwt) {
      setJwt(storedJwt);
    }
  }, [jwtAddressKey, connector]);

  const isAuthenticated = useMemo(() => {
    const isExpired = isTokenExpired(jwt);

    return !!jwt && !isExpired && !isAuthenticating && isConnected;
  }, [jwt, isAuthenticating, isConnected]);

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

  const renewJWT = useCallback(async () => {
    // If there's already a renewal in progress, return the existing promise
    if (renewalPromiseRef.current) {
      return renewalPromiseRef.current;
    }

    if (!address || !chainId) {
      return;
    }

    if (!jwtAddressKey) {
      return;
    }

    if (connections.length === 0) {
      return;
    }

    // Create and store the renewal promise
    renewalPromiseRef.current = (async () => {
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

        const message = new SiweMessage({
          domain: "my.gnosispay.com",
          address,
          statement: "Sign in with Ethereum to the app.",
          uri: "https://my.gnosispay.com",
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

        // TODO: REMOVE THIS AFTER TESTING
        try {
          const { data, error } = await postApiV1AuthChallenge({
            body: {
              ttlInSeconds: 600,
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
      } finally {
        renewalPromiseRef.current = null;
      }
    })();

    return renewalPromiseRef.current;
  }, [address, chainId, signMessageAsync, connections, jwtAddressKey, updateJwt]);

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
        renewJWT();
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
  }, [jwt, renewJWT]);

  useEffect(() => {
    const expired = isTokenExpired(jwt);

    if (jwt !== null && !expired) {
      // token is valid, no need to renew
      return;
    }

    renewJWT();
  }, [renewJWT, jwt]);

  const getJWT = useCallback(async () => {
    const expired = isTokenExpired(jwt);

    if (!jwt || expired) {
      return renewJWT();
    }

    return jwt;
  }, [jwt, renewJWT]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        getJWT,
        jwtContainsUserId,
        updateJwt,
        updateClient,
        renewJWT,
      }}
    >
      {children}
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
