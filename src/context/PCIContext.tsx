import { CollapsedError } from "@/components/collapsedError";
import GPSDK from "@gnosispay/pci-sdk";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type PCIContextProps = {
  children: ReactNode | ReactNode[];
};

export type IPCIContext = {
  getPciSdk: () => Promise<GPSDK | null | undefined>;
  isLoading: boolean;
};

interface IGetEphemeralTokenResponse {
  data: {
    token: string;
    expiresAt: string;
  };
}

interface ResponseData {
  success: boolean;
  message: string;
  responseObject: IGetEphemeralTokenResponse;
  statusCode: number;
}

const PCIContext = createContext<IPCIContext | undefined>(undefined);

const PCIContextProvider = ({ children }: PCIContextProps) => {
  const [ephemeralToken, setEphemeralToken] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pciSDK, setPciSDK] = useState<GPSDK | null>(null);
  const { getJWT } = useAuth();

  const getPciSdk = useCallback(async () => {
    if (!!pciSDK && !isTokenExpired()) {
      return pciSDK;
    }

    const jwt = await getJWT();
    const token = await getEphemeralToken();

    if (!token || !jwt) {
      const errorMessage = "Error getting ephemeral token or JWT";
      console.error(errorMessage);
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

    setPciSDK(gp);
  }, [getJWT, pciSDK]);

  const renewEphemeralToken = useCallback(async () => {
    const serverUrl = import.meta.env.VITE_PCI_RELAY_SERVER_URL;
    if (!serverUrl) {
      const errorMessage = "VITE_PCI_RELAY_SERVER_URL is not set";
      toast.error(errorMessage);
      console.error(errorMessage);
      return;
    }

    setIsLoading(true);

    const token = await fetch(serverUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const res: ResponseData = await response.json();

        if (!res.success) {
          const errorMessage = "Error getting ephemeral token";
          console.error(errorMessage, res);
          toast.error(<CollapsedError title={errorMessage} error={res} />);
          return;
        }

        const exp = new Date(res.responseObject.data.expiresAt).getTime();
        const token = res.responseObject.data.token;

        setEphemeralToken(token);
        setExpiredAt(exp);
        return token;
      })
      .catch((error) => {
        const errorMessage = "Error getting ephemeral token";
        console.error(errorMessage, error);
        toast.error(<CollapsedError title={errorMessage} error={error} />);
        return;
      })
      .finally(() => {
        setIsLoading(false);
      });

    return token;
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
    if (!!ephemeralToken && !isTokenExpired()) {
      return ephemeralToken;
    }

    return renewEphemeralToken();
  }, [ephemeralToken, renewEphemeralToken, isTokenExpired]);

  return <PCIContext.Provider value={{ isLoading, getPciSdk }}>{children}</PCIContext.Provider>;
};

const usePCI = () => {
  const context = useContext(PCIContext);
  if (context === undefined) {
    throw new Error("usePCI must be used within a PCIContextProvider");
  }
  return context;
};

export { PCIContextProvider, usePCI };
