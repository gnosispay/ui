import { CollapsedError } from "@/components/collapsedError";
import GPSDK, { Action } from "@gnosispay/pse-sdk";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const IFRAME_HOST = import.meta.env.VITE_IFRAME_HOST || "https://api-pse-public.gnosispay.com";
type PSEContextProps = {
  children: ReactNode | ReactNode[];
};

type ActionCallback = () => void;

export type IPSEContext = {
  getGpSdk: () => Promise<GPSDK | null | undefined>;
  isLoading: boolean;
  registerActionCallback: (action: Action, callback: ActionCallback) => void;
  unregisterActionCallback: (action: Action) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const { getJWT } = useAuth();
  const [actionCallbacks] = useState<Map<Action, ActionCallback>>(new Map());

  const registerActionCallback = useCallback(
    (action: Action, callback: ActionCallback) => {
      actionCallbacks.set(action, callback);
    },
    [actionCallbacks],
  );

  const unregisterActionCallback = useCallback(
    (action: Action) => {
      actionCallbacks.delete(action);
    },
    [actionCallbacks],
  );

  const getGpSdk = useCallback(async () => {
    const appId = import.meta.env.VITE_PSE_APP_ID;

    if (!appId) {
      const errorMessage = "VITE_PSE_APP_ID is not set";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
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
      appId,
      iframeHost: IFRAME_HOST,
      ephemeralToken: token,
      gnosisPayApiAuthToken: jwt,
      onActionSuccess: (action) => {
        const callback = actionCallbacks.get(action);
        if (action === Action.SetPin) {
          toast.success("PIN was successfully set");
          callback?.();
        } else if (action === Action.DoneSettingPin) {
          callback?.();
        } else {
          console.info("Unknown action successful", action);
          callback?.();
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

    return gp;
  }, [getJWT, actionCallbacks]);

  const getEphemeralToken = useCallback(async () => {
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

      const token = res.responseObject.data.ephemeralToken;

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

  return (
    <PSEContext.Provider value={{ isLoading, getGpSdk, registerActionCallback, unregisterActionCallback }}>
      {children}
    </PSEContext.Provider>
  );
};

const usePSE = () => {
  const context = useContext(PSEContext);
  if (context === undefined) {
    throw new Error("usePSE must be used within a PSEContextProvider");
  }
  return context;
};

export { PSEContextProvider, usePSE };
