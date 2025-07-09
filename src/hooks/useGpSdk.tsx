import { CollapsedError } from "@/components/collapsedError";
import { useAuth } from "@/context/AuthContext";
import GPSDK, { ElementType, type Action } from "@gnosispay/pse-sdk";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const IFRAME_HOST = import.meta.env.VITE_IFRAME_HOST || "https://api-pse-public.gnosispay.com";

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

export const useGpSdk = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getJWT } = useAuth();

  const showError = useCallback((message: string, error?: unknown) => {
    console.error(message, error);
    toast.error(<CollapsedError title={message} error={error} />);
  }, []);

  const getGpSdk = useCallback(
    async ({ actionCallback }: { actionCallback?: (action?: Action) => void } = {}) => {
      const appId = import.meta.env.VITE_PSE_APP_ID;

      if (!appId) {
        showError("VITE_PSE_APP_ID is not set");
        return;
      }

      const jwt = await getJWT();
      const token = await getEphemeralToken();

      if (!token || !jwt) {
        showError("Error getting ephemeral token or JWT", { jwt, token });
        return;
      }

      const gp = new GPSDK({
        appId,
        iframeHost: IFRAME_HOST,
        ephemeralToken: token,
        gnosisPayApiAuthToken: jwt,
        onActionSuccess: (action) => {
          actionCallback?.(action);
        },
        onInvalidToken: (message) => {
          showError("Ephemeral token is invalid", message);
        },
        onError: (message, details) => {
          showError("An error occurred", { message, details });
        },
      });

      return gp;
    },
    [getJWT, showError],
  );

  const showCardDetails = useCallback(
    async (cardToken: string, cardDataId: string) => {
      const gpSdk = await getGpSdk();

      if (!gpSdk) {
        showError("PSE SDK not initialized");
        return;
      }

      gpSdk.init(ElementType.CardData, `#${cardDataId}`, {
        cardToken,
      });
    },
    [getGpSdk, showError],
  );

  const showPin = useCallback(
    async (cardToken: string, pinDataId: string) => {
      const gpSdk = await getGpSdk();

      if (!gpSdk) {
        showError("PSE SDK not initialized");
        return;
      }

      gpSdk.init(ElementType.CardPin, `#${pinDataId}`, {
        cardToken,
      });
    },
    [getGpSdk, showError],
  );

  const getEphemeralToken = useCallback(async () => {
    const serverUrl = import.meta.env.VITE_PSE_RELAY_SERVER_URL;

    if (!serverUrl) {
      showError("VITE_PSE_RELAY_SERVER_URL is not set");
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
        showError("Error getting ephemeral token", res);
        return;
      }

      const token = res.responseObject.data.ephemeralToken;

      return token;
    } catch (error) {
      showError("Error getting ephemeral token", error);
      return;
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  return { getGpSdk, isLoading, showCardDetails, showPin };
};
