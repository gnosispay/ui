import { getApiV1AuthNonce, postApiV1AuthChallenge } from "@/client";
import { client } from "@/client/client.gen";
import { CollapsedError } from "@/components/collapsedError";
import { isTokenExpired } from "@/utils/isTokenExpired";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
};

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const connections = useConnections();
  const jwtAddressKey = useMemo(() => {
    if (!address) return "";
    return `${LOCALSTORAGE_JWT_KEY}.${address}`;
  }, [address]);

  useEffect(() => {
    if (!jwtAddressKey) {
      return;
    }

    const storedJwt = localStorage.getItem(jwtAddressKey);

    if (storedJwt) {
      setJwt(storedJwt);
    }
  }, [jwtAddressKey]);

  const isAuthenticated = useMemo(() => {
    const isExpired = isTokenExpired(jwt);

    return !!jwt && !isExpired && !isAuthenticating && !!address && !!chainId && connections.length > 0;
  }, [jwt, isAuthenticating, address, chainId, connections]);

  // todo implement interceptor to refresh the jwt if it's expired
  // see https://heyapi.dev/openapi-ts/clients/fetch#interceptors

  const updateClient = useCallback(() => {
    client.setConfig({
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    setIsAuthenticating(false);
  }, [jwt]);

  useEffect(() => {
    if (!jwt) {
      return;
    }

    updateClient();
  }, [jwt, updateClient]);

  const renewToken = useCallback(async () => {
    if (!address || !chainId) {
      console.info("No address or chainId");
      return;
    }

    if (!jwtAddressKey) {
      console.info("No jwtAddressKey");
      return;
    }

    if (connections.length === 0) {
      console.info("No connections");
      return;
    }

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
      domain: "gnosispay.com",
      address,
      statement: "Sign in with Ethereum to the app.",
      uri: "https://www.gnosispay.com",
      version: "1",
      chainId,
      // nonce is not properly typed in our api
      nonce: data as string,
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

      localStorage.setItem(jwtAddressKey, data.token);
      setJwt(data.token);
      return data.token;
    } catch (error) {
      console.error("Error validating message", error);
      toast.error(<CollapsedError title="Error validating message" error={error} />);
      setIsAuthenticating(false);
      return;
    }
  }, [address, chainId, signMessageAsync, connections, jwtAddressKey]);

  useEffect(() => {
    const expired = isTokenExpired(jwt);

    if (jwt !== null && !expired) {
      // token is valid, no need to renew
      return;
    }

    renewToken();
  }, [renewToken, jwt]);

  const getJWT = useCallback(async () => {
    const expired = isTokenExpired(jwt);

    if (!jwt || expired) {
      return renewToken();
    }

    return jwt;
  }, [jwt, renewToken]);

  return <AuthContext.Provider value={{ isAuthenticated, isAuthenticating, getJWT }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};

export { AuthContextProvider, useAuth };
