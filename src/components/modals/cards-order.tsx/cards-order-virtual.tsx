import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { postApiV1OrderCreate } from "@/client";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCards } from "@/context/CardsContext";
import { toast } from "sonner";
import { CollapsedError } from "@/components/collapsedError";

interface CardsOrderVirtualProps {
  onClose: () => void;
}

export const CardsOrderVirtual = ({ onClose }: CardsOrderVirtualProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCards } = useCards();
  const [nameOnCard, setNameOnCard] = useState("");

  const onCardOrder = useCallback(() => {
    setIsLoading(true);

    postApiV1OrderCreate({
      body: {
        virtual: true,
        ENSName: nameOnCard,
        personalizationSource: "ENS",
      },
    })
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
  }, [refreshCards, nameOnCard, onClose]);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nameOnCard">Name on the card</Label>
          <Input
            id="nameOnCard"
            placeholder="Your name or ENS name"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
          />
        </div>

        <DialogFooter className="justify-end">
          <Button disabled={isLoading || !nameOnCard.trim()} loading={isLoading} onClick={onCardOrder}>
            Order Virtual Card
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
};
