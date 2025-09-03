import { CR_CLASSIFICATION_ID, ZENDESK_TICKET_TYPES, ZENDESK_USER_ID_FIELD_ID } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useZendesk } from "react-use-zendesk";

export const ticketReasons = {
  [ZENDESK_TICKET_TYPES.LOST_CARD]: "card_services__card_management__lost_card",
  [ZENDESK_TICKET_TYPES.STOLEN_CARD]: "card_services__card_management__stolen_card",
  [ZENDESK_TICKET_TYPES.DISPUTE_TRANSACTION]: "financial___transactional__transaction__dispute",
  [ZENDESK_TICKET_TYPES.FRAUDULENT_TRANSACTION]: "financial___transactional__transaction__fraudulent_activity",
};

export const useMyZendesk = () => {
  const { user } = useUser();
  const { setConversationFields, open, setConversationTags, isOpen } = useZendesk();

  const zendeskKey = import.meta.env.VITE_ZENDESK_KEY;

  const noop = () => {};

  if (!zendeskKey) {
    return {
      openZendeskChat: noop,
      openTicket: noop,
    };
  }

  const openZendeskChat = (conversationFields?: { id: string; value: string | number | boolean }[]) => {
    open();

    const userFields = user?.id ? [{ id: ZENDESK_USER_ID_FIELD_ID, value: user.id }] : [];

    const allFields = conversationFields ? [...userFields, ...conversationFields] : userFields;

    if (allFields.length > 0) {
      setConversationFields(allFields);
    }
  };

  const openTicket = (reason: ZENDESK_TICKET_TYPES) => {
    if (!ticketReasons[reason]) {
      return console.warn(`No Zendesk ticket type found for reason: ${reason}`);
    }

    return openZendeskChat([{ id: CR_CLASSIFICATION_ID, value: ticketReasons[reason] }]);
  };

  return {
    openZendeskChat,
    openTicket,
  };
};

export const useZendeskUserId = () => {
  const { user } = useUser();
  const { isOpen, setConversationFields } = useZendesk();
  const [isFieldSet, setIsFieldSet] = useState(false);

  useEffect(() => {
    if (user?.id && isOpen && !isFieldSet) {
      setConversationFields([{ id: ZENDESK_USER_ID_FIELD_ID, value: user.id }]);
      console.log("Setting user id field", ZENDESK_USER_ID_FIELD_ID, user.id);
      setIsFieldSet(true);
    }
  }, [user?.id, isOpen, isFieldSet, setConversationFields]);
};
