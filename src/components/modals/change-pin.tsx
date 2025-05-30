import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card } from "../../client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import type GPSDK from "@gnosispay/pse-sdk";
import { ElementType, Action } from "@gnosispay/pse-sdk";
import { usePSE } from "@/context/PSEContext";

interface Props {
  onClose: () => void;
  card: Card;
}

export const ChangePinModal = ({ onClose, card }: Props) => {
  const { getGpSdk, registerActionCallback, unregisterActionCallback } = usePSE();
  const setPinId = useMemo(() => `pse-setpin-${card.id}`, [card.id]);
  const [pinInputIframe, setPinInputIframe] = useState<ReturnType<GPSDK["init"]> | null>(null);

  useEffect(() => {
    if (!card.cardToken) {
      const errorMessage = "No card token";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    showPinIframe(card.cardToken);

    registerActionCallback(Action.DoneSettingPin, () => {
      onOpenChange(false);
    });

    return () => {
      unregisterActionCallback(Action.DoneSettingPin);
    };
  }, [card, registerActionCallback, unregisterActionCallback]);

  const showPinIframe = useCallback(
    async (cardToken: string) => {
      const gpSdk = await getGpSdk();
      if (!gpSdk) {
        const errorMessage = "PSE SDK not initialized";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const sp = gpSdk.init(ElementType.SetCardPin, `#${setPinId}`, {
        cardToken,
      });

      setPinInputIframe(sp);
    },
    [getGpSdk, setPinId],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        pinInputIframe?.destroy();
        onClose();
      }
    },
    [onClose, pinInputIframe],
  );

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Change pin</DialogTitle>
        <div className="grid flex-1 gap-2">
          <div id={setPinId} className="h-68" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
