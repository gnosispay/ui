import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { postApiV1CardsVirtual } from "@/client";
import { DialogFooter } from "@/components/ui/dialog";
import { useCards } from "@/context/CardsContext";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";

interface CardsOrderVirtualProps {
  onClose: () => void;
  onGoBack: () => void;
}

export const CardsOrderVirtual = ({ onClose, onGoBack }: CardsOrderVirtualProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCards } = useCards();

  const onCardOrder = useCallback(() => {
    setIsLoading(true);

    postApiV1CardsVirtual()
      .then(({ error }) => {
        if (error) {
          console.error("Error ordering card: ", error);
          toast.error(<CollapsedError title="Error ordering card" error={error} />);
          return;
        }

        toast.success("Virtual card ordered successfully");
        refreshCards();
      })
      .catch((error) => {
        console.error("Error ordering card: ", error);
        toast.error(<CollapsedError title="Error ordering card" error={error} />);
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  }, [refreshCards, onClose]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          The card will be available in your dashboard immediately for online purchases. You can also add it manually to
          your mobile wallet for offline purchases.
        </p>
      </div>
      <DialogFooter className="justify-end">
        <Button variant="outline" onClick={onGoBack}>
          Back
        </Button>
        <Button disabled={isLoading} loading={isLoading} onClick={onCardOrder}>
          Order Virtual Card
        </Button>
      </DialogFooter>
    </div>
  );
};
