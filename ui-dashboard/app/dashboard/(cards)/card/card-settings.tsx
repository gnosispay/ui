"use client";
import { Snowflake, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { useState } from "react";
import Dialog from "@/components/dialog";
import Button from "@/components/buttons/buttonv2";
import { useZendesk } from "@/hooks/use-zendesk";
import { ZENDESK_TICKET_TYPES } from "@/lib/constants";
import PingSettings from "./pin-settings";
import {
  freezeCard,
  markCardAsLost,
  markCardAsStolen,
  unFreezeCard,
} from "./action";

const ReportLostCardButton = ({ cardId }: { cardId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);


  const { openTicket } = useZendesk();


  const handleReportLostCard = async () => {
    if (!cardId) {
      return;
    }
    await markCardAsLost(cardId);

    openTicket(ZENDESK_TICKET_TYPES.LOST_CARD);

    handleClose();
  };

  return (
    <>
      <Dialog isOpen={isOpen} handleClose={handleClose}>
        <div className="py-2 px-4">
          <h2 className="font-semibold mb-4">Report card as lost</h2>
          <p className="mb-6 bg-orange-50 rounded-md p-4">
            Please note that this is a non-reversible action. Once a card is
            reported as lost, it cannot be undone.
          </p>
          <Button
            onClick={handleReportLostCard}
            className="ml-auto bg-red-50 text-red-700 border h-fit rounded-lg whitespace-nowrap font-medium"
          >
            Report as Lost
          </Button>
        </div>
      </Dialog>
      <Button
        onClick={handleOpen}
        className="px-2 py-1 text-sm bg-white border-red-700 text-red-700 border h-fit rounded-lg whitespace-nowrap font-medium"
      >
        Report card as lost
      </Button>
    </>
  );
};

const ReportCardStolenButton = ({ cardId }: { cardId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  const { openTicket } = useZendesk();


  const handleCancelCard = async () => {
    if (!cardId) {
      return;
    }
    await markCardAsStolen(cardId);
    openTicket(ZENDESK_TICKET_TYPES.STOLEN_CARD);
    handleClose();
  };

  return (
    <>
      <Dialog isOpen={isOpen} handleClose={handleClose}>
        <div className="py-2 px-4">
          <h2 className="font-semibold mb-4">Report card as stolen</h2>
          <p className="mb-6 bg-orange-50 rounded-md p-4">
            Please note that this is a non-reversible action. Once a card is
            reported as stolen, it cannot be undone.
          </p>
          <Button
            onClick={handleCancelCard}
            className="ml-auto bg-red-50 text-red-700 border h-fit rounded-lg whitespace-nowrap font-medium"
          >
            Report as Stolen
          </Button>
        </div>
      </Dialog>
      <Button
        onClick={handleOpen}
        className="px-2 py-1 text-sm bg-white border-red-700 text-red-700 border h-fit rounded-lg whitespace-nowrap font-medium"
      >
        Report card as stolen
      </Button>
    </>
  );
};

const CardSettings = ({
  cardId,
  isFrozen: defaultIsFrozen,
  isVirtual,
}: {
  cardId?: string;
  isFrozen: boolean;
  isVirtual: boolean;
}) => {
  // const isFrozen = defaultIsFrozen;
  const [isFrozen, setIsFrozen] = useState(defaultIsFrozen);

  const handleFreezeToggle = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!cardId) {
      return;
    }
    if (event.target.checked) {
      setIsFrozen(event.target.checked);
      try {
        await freezeCard(cardId);
      } catch (error) {
        setIsFrozen(false);
      }
    }
    if (!event.target.checked) {
      setIsFrozen(event.target.checked);
      try {
        await unFreezeCard(cardId);
      } catch (error) {
        setIsFrozen(true);
      }
    }
  };

  return (
    <div className="border-gp-border border rounded-2xl shadow-gp-container overflow-hidden">
      <div className="flex flex-col gap-4 pl-16 pr-8 pt-8 pb-4 relative">
        <Snowflake className="h-6 w-6 text-gray-400 absolute top-8 left-6" />
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg">Freeze card</h2>
            <p className="text-gp-text-lc">
              While frozen, no payments will go through.
            </p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFrozen}
                className="sr-only peer"
                onChange={handleFreezeToggle}
              />
              <div className="w-[3.25rem] h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:shadow-md after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
        {!isVirtual && <div className="h-[1px] w-full bg-gray-300" />}
      </div>
      {/* disable change pin option for now */}
      {!isVirtual && <PingSettings cardId={cardId} />}
      <div className="flex flex-col gap-4 pl-16 pr-8 pt-6 pb-8 relative bg-red-50">
        <WarningCircle className="h-6 w-6 text-red-600 absolute top-6 left-6" />
        <div className="flex-col flex sm:flex-row justify-between sm:gap-10 gap-4">
          <div>
            <h2 className="text-lg">Lost or stolen card</h2>
            <p>Cancel your card and we will ship you a new one</p>
            <p className="text-gp-text-lc mt-2 text-sm">
              This will open a ticket with our support team.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <ReportCardStolenButton cardId={cardId as string} />
            <ReportLostCardButton cardId={cardId as string} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSettings;
