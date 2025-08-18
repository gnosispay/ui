import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card } from "../../client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import type GPSDK from "@gnosispay/pse-sdk";
import { ElementType, Action } from "@gnosispay/pse-sdk";
import { useGpSdk } from "@/hooks/useGpSdk";
import { PSEDialogContent, PSEDialogTitle } from "../PSEDialog";

interface Props {
  onClose: () => void;
  card: Card;
}

export const ChangePinModal = ({ onClose, card }: Props) => {
  const setPinId = useMemo(() => `pse-setpin-${card.id}`, [card.id]);
  const [pinInputIframe, setPinInputIframe] = useState<ReturnType<GPSDK["init"]> | null>(null);
  const actionCallback = useCallback(
    (action?: Action) => {
      if (action === Action.DoneSettingPin) {
        onClose();
      }

      if (action === Action.SetPin) {
        toast.success("Pin changed successfully");
      }
    },
    [onClose],
  );

  const { getGpSdk } = useGpSdk();

  const showPinIframe = useCallback(
    async (cardToken: string) => {
      const gpSdk = await getGpSdk({ actionCallback });
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
    [getGpSdk, setPinId, actionCallback],
  );

  useEffect(() => {
    if (!card.cardToken) {
      const errorMessage = "No card token";
      console.error(errorMessage);
      toast.error(errorMessage);
      return;
    }

    showPinIframe(card.cardToken);
  }, [card, showPinIframe]);

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
      <PSEDialogContent>
        <PSEDialogTitle>Change pin</PSEDialogTitle>
        <div className="grid flex-1 gap-2">
          <div id={setPinId} className="h-68" />
        </div>
      </PSEDialogContent>
    </Dialog>
  );
};
