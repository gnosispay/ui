import { getApiV1AuthNonce, postApiV1AuthChallenge } from "@/client";
import { client } from "@/client/client.gen";
import { CollapsedError } from "@/components/collapsedError";
import { BASE_URL, LOCALSTORAGE_JWT_KEY } from "@/main";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SiweMessage } from "siwe";
import { toast } from "sonner";
import { useAccount, useConnections, useSignMessage } from "wagmi";

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
  const [jwt, setJwt] = useState<string | null>(localStorage.getItem(LOCALSTORAGE_JWT_KEY));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const connections = useConnections();
  const isTokenExpired = useCallback(() => {
    // console.log("Checking if token is expired", jwt);
    if (!jwt) {
      return true;
    }

    const decodedToken = jwtDecode(jwt);

    if (!decodedToken.exp) {
      return true;
    }

    const currentDate = new Date();

    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.info("Token expired.");
      return true;
    }

    // console.log("Token not expired.");
    return false;
  }, [jwt]);

  const isAuthenticated = useMemo(() => {
    const isExpired = isTokenExpired();

    return !!jwt && !isExpired && !isAuthenticating && !!address && !!chainId && connections.length > 0;
  }, [jwt, isTokenExpired, isAuthenticating, address, chainId, connections]);

  // todo implement interceptor to refresh the jwt if it's expired
  // see https://heyapi.dev/openapi-ts/clients/fetch#interceptors

  const updateClient = useCallback(() => {
    // console.log("Updating client with jwt:", jwt);
    client.setConfig({
      baseUrl: BASE_URL,
      // set default headers for requests
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
    // console.log("Renewing token");

    if (!address || !chainId) {
      console.info("No address or chainId");
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

      localStorage.setItem(LOCALSTORAGE_JWT_KEY, data.token);
      setJwt(data.token);
      return data.token;
    } catch (error) {
      console.error("Error validating message", error);
      toast.error(<CollapsedError title="Error validating message" error={error} />);
      setIsAuthenticating(false);
      return;
    }
  }, [address, chainId, signMessageAsync, connections]);

  useEffect(() => {
    const isExpired = isTokenExpired();

    if (jwt !== null && !isExpired) {
      // token is valid, no need to renew
      return;
    }

    renewToken();
  }, [renewToken, isTokenExpired, jwt]);

  const getJWT = useCallback(async () => {
    const isExpired = isTokenExpired();

    if (!jwt || isExpired) {
      return renewToken();
    }

    return jwt;
  }, [jwt, renewToken, isTokenExpired]);

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
