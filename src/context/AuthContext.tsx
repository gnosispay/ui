import { getApiV1AuthNonce, postApiV1AuthChallenge } from "@/client";
import { client } from "@/client/client.gen";
import { BASE_URL, LOCALSTORAGE_JWT_KEY } from "@/main";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useConnections, useSignMessage } from "wagmi";

type AuthContextProps = {
  children: ReactNode | ReactNode[];
};

export type IAuthContext = {
  renewToken: () => void;
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
  const isTokenExpired = useMemo(() => {
    if (!jwt) {
      return false;
    }

    const decodedToken = jwtDecode(jwt);

    if (!decodedToken.exp) {
      return true;
    }

    const currentDate = new Date();

    // JWT exp is in seconds
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      console.log("Token expired.");
      setJwt(null);
      return true;
    }

    console.log("Valid token");
    return false;
  }, [jwt]);
  const isAuthenticated = useMemo(
    () => !!jwt && !isTokenExpired && !isAuthenticating,
    [jwt, isTokenExpired, isAuthenticating],
  );

  // todo implement interceptor to refresh the jwt if it's expired
  // see https://heyapi.dev/openapi-ts/clients/fetch#interceptors

  const updateClient = useCallback(() => {
    console.log("Updating client with jwt:", jwt);
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
    if (!address || !chainId) {
      console.log("No address or chainId");
      return;
    }

    if (connections.length === 0) {
      console.log("No connections");
      return;
    }

    const { data, error } = await getApiV1AuthNonce();

    if (error) {
      console.error(error);
      return;
    }

    if (!data) {
      console.error("No nonce returned");
      return;
    }

    console.log("using nonce:", data);

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
      return;
    }

    if (!signature) {
      console.error("No signature returned");
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
        console.error(error);
        return;
      }

      if (!data?.token) {
        console.error("No token returned");
        return;
      }

      console.log("Token returned:", data.token);
      return data.token;
    } catch (error) {
      console.error("Error validating message", error);
      return;
    }
  }, [address, chainId, signMessageAsync, connections]);

  useEffect(() => {
    if (jwt !== null && !isTokenExpired) {
      console.log("Token is valid");
      return;
    }

    setIsAuthenticating(true);

    renewToken()
      .then((token) => {
        if (!token) {
          console.error("No token returned");
          return;
        }
        localStorage.setItem(LOCALSTORAGE_JWT_KEY, token);
        setJwt(token);
      })
      .catch((error) => {
        setIsAuthenticating(false);
        console.error("Error renewing token", error);
      });
  }, [renewToken, isTokenExpired, jwt]);

  return (
    <AuthContext.Provider value={{ renewToken, isAuthenticated, isAuthenticating }}>{children}</AuthContext.Provider>
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
