import { Button } from "../ui/button";
import { useCallback, useState } from "react";
import { postApiV1OrderCreate } from "../../client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useUser } from "@/context/UserContext";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export const VirtualCardsOrderModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCards } = useUser();
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
      .then(({ data, error }) => {
        if (error) {
          console.error("Error ordering card: ", error);
        }

        console.log("Card order data: ", data);
      })
      .catch((error) => {
        console.error("Error ordering card: ", error);
      })
      .finally(() => {
        setIsLoading(false);
        setOpen(false);
        refreshCards();
      });
  }, [refreshCards, nameOnCard]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-6">Order Virtual Card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Virtual card order</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="nameOnCard">Name on the card</Label>
            <Input
              id="nameOnCard"
              placeholder="Your name or ENS name"
              onChange={(e) => setNameOnCard(e.target.value)}
            />
            <DialogFooter className="justify-end">
              <Button disabled={isLoading} loading={isLoading} onClick={onCardOrder}>
                Order
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </DialogContent>
    </Dialog>
  );
};
