import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { postApiV1OrderCreate } from "../../client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useCards } from "@/context/CardsContext";
import { toast } from "sonner";
import { CollapsedError } from "../collapsedError";

export const VirtualCardsOrderModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCards } = useCards();
  const [nameOnCard, setNameOnCard] = useState("");

  const onCardOrder = useCallback(async () => {
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
        setOpen(false);
      });
  }, [refreshCards, nameOnCard]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-6">
          Order Virtual Card
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Virtual card order</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="nameOnCard">Name on the card</Label>
          <Input id="nameOnCard" placeholder="Your name or ENS name" onChange={(e) => setNameOnCard(e.target.value)} />
          <DialogFooter className="justify-end">
            <Button disabled={isLoading} loading={isLoading} onClick={onCardOrder}>
              Order
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
