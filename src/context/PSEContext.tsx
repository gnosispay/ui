import { CollapsedError } from "@/components/collapsedError";
import GPSDK from "@gnosispay/pci-sdk";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type PSEContextProps = {
  children: ReactNode | ReactNode[];
};

export type IPSEContext = {
  getGpSdk: () => Promise<GPSDK | null | undefined>;
  isLoading: boolean;
};

interface IGetEphemeralTokenResponse {
  data: {
    ephemeralToken: string;
    expiresAt: string;
  };
}

interface ResponseData {
  success: boolean;
  message: string;
  responseObject: IGetEphemeralTokenResponse;
  statusCode: number;
}

const PSEContext = createContext<IPSEContext | undefined>(undefined);

const PSEContextProvider = ({ children }: PSEContextProps) => {
  const [ephemeralToken, setEphemeralToken] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gpSDK, setGpSDK] = useState<GPSDK | null>(null);
  const { getJWT } = useAuth();

  const getGpSdk = useCallback(async () => {
    const tokenExpired = isTokenExpired();

    if (!!gpSDK && !tokenExpired) {
      return gpSDK;
    }

    const jwt = await getJWT();
    const token = await getEphemeralToken();

    if (!token || !jwt) {
      const errorMessage = "Error getting ephemeral token or JWT";
      console.error(errorMessage);
      console.error("jwt", jwt);
      console.error("token", token);
      toast.error(errorMessage);
      return;
    }
    const gp = new GPSDK({
      ephemeralToken: token,
      gnosisPayApiAuthToken: jwt,
      onActionSuccess: (action) => {
        if (action === "SetPin") {
          toast.success("PIN was successfully set");
          console.log("PIN was successfully set");
        } else {
          console.log("Unkown action succesful", action);
        }
      },
      onInvalidToken: (message) => {
        const errorMessage = "Ephemeral token is invalid";

        console.error(errorMessage, message);
        toast.error(<CollapsedError title={errorMessage} error={message} />);
      },
      onError: (message, details) => {
        const errorMessage = "An error occurred";

        toast.error(<CollapsedError title={errorMessage} error={details} />);
        console.error("An error occurred", message, details);
      },
    });

    setGpSDK(gp);
    return gp;
  }, [getJWT, gpSDK]);

  const renewEphemeralToken = useCallback(async () => {
    const serverUrl = import.meta.env.VITE_PSE_RELAY_SERVER_URL;

    if (!serverUrl) {
      const errorMessage = "VITE_PSE_RELAY_SERVER_URL is not set";
      toast.error(errorMessage);
      console.error(errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(serverUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res: ResponseData = await response.json();

      if (!res.success) {
        const errorMessage = "Error getting ephemeral token";
        console.error(errorMessage, res);
        toast.error(<CollapsedError title={errorMessage} error={res} />);
        return;
      }

      const exp = new Date(res.responseObject.data.expiresAt).getTime();
      const token = res.responseObject.data.ephemeralToken;

      setEphemeralToken(token);
      setExpiredAt(exp);

      return token;
    } catch (error) {
      const errorMessage = "Error getting ephemeral token";
      console.error(errorMessage, error);
      toast.error(<CollapsedError title={errorMessage} error={error} />);
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isTokenExpired = useCallback(() => {
    if (!ephemeralToken) {
      return true;
    }

    if (expiredAt === 0) {
      return true;
    }

    return expiredAt > new Date().getTime();
  }, [expiredAt, ephemeralToken]);

  const getEphemeralToken = useCallback(async () => {
    const isExpired = isTokenExpired();

    if (!!ephemeralToken && !isExpired) {
      console.log("Using existing ephemeral token");
      return ephemeralToken;
    }

    return renewEphemeralToken();
  }, [ephemeralToken, renewEphemeralToken, isTokenExpired]);

  return <PSEContext.Provider value={{ isLoading, getGpSdk: getGpSdk }}>{children}</PSEContext.Provider>;
};

const usePSE = () => {
  const context = useContext(PSEContext);
  if (context === undefined) {
    throw new Error("usePSE must be used within a PSEContextProvider");
  }
  return context;
};

export { PSEContextProvider, usePSE };
