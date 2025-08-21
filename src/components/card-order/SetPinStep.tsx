import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type GPSDK from "@gnosispay/pse-sdk";
import { ElementType, Action } from "@gnosispay/pse-sdk";
import { useGpSdk } from "@/hooks/useGpSdk";
import { StandardAlert } from "../ui/standard-alert";
import { useCards } from "@/context/CardsContext";
import { useTheme } from "@/context/ThemeContext";

interface SetPinStepProps {
  cardToken: string | null;
  onBack: () => void;
}

export const SetPinStep = ({ cardToken }: SetPinStepProps) => {
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  const { refreshCards } = useCards();
  const iframeId = useMemo(() => `pse-setpin-new-card-${cardToken}`, [cardToken]);
  const pinInputIframeRef = useRef<ReturnType<GPSDK["init"]> | null>(null);
  const { getGpSdk } = useGpSdk();
  const [error, setError] = useState<string | null>(null);

  const actionCallback = useCallback(
    (action?: Action) => {
      if (action === Action.DoneSettingPin) {
        pinInputIframeRef.current?.destroy();
        refreshCards();
        navigate("/cards");
      }
    },
    [navigate, refreshCards],
  );

  const showPinIframe = useCallback(
    async (cardToken: string) => {
      try {
        const gpSdk = await getGpSdk({ actionCallback });
        if (!gpSdk) {
          const errorMessage = "PSE SDK not initialized";
          console.error(errorMessage);
          setError(errorMessage);
          return;
        }

        const sp = gpSdk.init(ElementType.SetCardPin, `#${iframeId}`, {
          cardToken,
        });

        pinInputIframeRef.current = sp;
      } catch (error) {
        console.error("Error initializing PIN iframe:", error);
        setError("Failed to initialize PIN setting");
      }
    },
    [getGpSdk, iframeId, actionCallback],
  );

  useEffect(() => {
    if (!cardToken) {
      const errorMessage = "No card token provided";
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }

    showPinIframe(cardToken);
  }, [cardToken, showPinIframe]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Set Your Card PIN</h1>
        <p className="text-muted-foreground mt-2">
          Your card has been created successfully. Please set a secure PIN to complete the process.
        </p>
      </div>
      {error && <StandardAlert variant="destructive" description={error} className="mb-6" />}

      <div className={`flex justify-center ${effectiveTheme === "dark" ? "bg-white text-black py-4" : ""}`}>
        <div id={iframeId} className="w-full max-w-md min-h-64" style={{ minHeight: "400px" }} />
      </div>
    </div>
  );
};
