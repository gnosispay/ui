import { useState } from "react";
import { Popover } from "@headlessui/react";
import { DotsThree } from "@phosphor-icons/react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { disputeTransaction } from "@/lib/dispute-transaction";
import { reportFraudulentTransaction } from "@/lib/report-fraudulent-transaction";
import { useZendesk } from "@/hooks/use-zendesk";
import { ZENDESK_TICKET_TYPES } from "@/lib/constants";
import ActionModal from "./action-modal";
import type { SyntheticEvent } from "react";
import type { Event } from "@gnosispay/types";

const actionTypes = {
  DISPUTE_TX: "dispute",
  UNRECOGNIZED_TX: "unrezognized_tx",
};

export type ModalContent = {
  title: string;
  description: string;
  transaction: Event;
  actionTitle: string;
  action: () => void;
};

interface TransactionActionsProps {
  transaction: Event;
}
const TransactionActions = ({ transaction }: TransactionActionsProps) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: "",
    description: "",
    transaction,
    actionTitle: "",
    action: () => {},
  });

  const { openTicket } = useZendesk();

  const isZendeskEnabled = useFeatureFlagEnabled(
    "zendesk-instead-of-intercom-enabled",
  );

  const posthogFeatureFlagsInitialized =
    typeof isZendeskEnabled !== "undefined";

  if (!posthogFeatureFlagsInitialized) {
    return null;
  }

  interface OpenActionModalParams {
    e: SyntheticEvent;
    actionType: string;
  }
  const openActionModal = ({ e, actionType }: OpenActionModalParams) => {
    e.preventDefault();

    setModalContent({
      ...getModalContent({ actionType }),
      transaction,
    });
    setModalVisible(true);
  };

  const handleTxDispute = async () => {
    disputeTransaction({ transaction });
    if (isZendeskEnabled) {
      openTicket(ZENDESK_TICKET_TYPES.DISPUTE_TRANSACTION);
    }
  };

  const handleUnrecognizedTx = async () => {
    reportFraudulentTransaction({ transaction });
    if (isZendeskEnabled) {
      openTicket(ZENDESK_TICKET_TYPES.FRAUDULENT_TRANSACTION);
    }
  };

  interface GetModalContentParams {
    actionType: string;
  }
  const getModalContent = ({ actionType }: GetModalContentParams) => {
    if (actionType === actionTypes.DISPUTE_TX) {
      return {
        title: "Dispute this transaction",
        description:
          "In case you recognise this transaction and there has been an issue with the goods or services of the transaction itself, we can investigate this for you.",
        actionTitle: "Dispute transaction",
        action: () => handleTxDispute(),
      };
    }
    if (actionType === actionTypes.UNRECOGNIZED_TX) {
      return {
        title: "Don’t recognise this transaction",
        description:
          "In case you think someone has fraudulently made this transaction or someone has access to your card/card details, we can freeze your card while we investigate, before blocking and issuing you a new card.",
        actionTitle: "Freeze and report",
        action: () => handleUnrecognizedTx(),
      };
    }
    throw "Could not find modal content for requested action";
  };

  return (
    <div className="relative">
      <Popover>
        <>
          <Popover.Button className="focus:outline-none flex justify-center">
            <DotsThree className="text-stone-800 text-2xl font-extrabold" />
          </Popover.Button>

          <Popover.Panel className="absolute -left-52 top-6 z-10 bg-white shadow-lg rounded-md overflow-hidden text-stone-900 text-sm">
            <div className="grid grid-cols-1">
              <button
                className="hover:bg-stone-100 p-3 text-left"
                onClick={(e) => {
                  openActionModal({ e, actionType: actionTypes.DISPUTE_TX });
                }}
              >
                Dispute this transaction
              </button>
              <button
                className="hover:bg-stone-100 p-3 text-left border-t"
                onClick={(e) => {
                  openActionModal({
                    e,
                    actionType: actionTypes.UNRECOGNIZED_TX,
                  });
                }}
              >
                Don&apos;t recognize this transaction
              </button>
            </div>
          </Popover.Panel>
        </>
      </Popover>

      <ActionModal
        isOpen={modalVisible}
        modalContent={modalContent}
        handleClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default TransactionActions;
