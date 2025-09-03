"use client";

import {
  CR_CLASSIFICATION_ID,
  ZENDESK_TICKET_TYPES,
  ZENDESK_USER_ID_FIELD_ID,
} from "@/lib/constants";
import useUser from "./use-user";

export const ticketReasons = {
  [ZENDESK_TICKET_TYPES.LOST_CARD]: "card_services__card_management__lost_card",
  [ZENDESK_TICKET_TYPES.STOLEN_CARD]:
    "card_services__card_management__stolen_card",
  [ZENDESK_TICKET_TYPES.DISPUTE_TRANSACTION]:
    "financial___transactional__transaction__dispute",
  [ZENDESK_TICKET_TYPES.FRAUDULENT_TRANSACTION]:
    "financial___transactional__transaction__fraudulent_activity",
};

export const useZendesk = () => {
  const user = useUser();
  const zendeskKey = process.env.NEXT_PUBLIC_ZENDESK_KEY;

  const noop = () => {};

  if (!zendeskKey) {
    return {
      openZendeskChat: noop,
      openTicket: noop,
    };
  }

  const openZendeskChat = (
    conversationFields?: { id: string; value: string | number | boolean }[],
  ) => {
    window.zE("messenger", "open");

    const userFields = user.data?.id
      ? [{ id: ZENDESK_USER_ID_FIELD_ID, value: user.data.id }]
      : [];

    const allFields = conversationFields
      ? [...userFields, ...conversationFields]
      : userFields;

    if (allFields.length > 0) {
      window.zE("messenger:set", "conversationFields", allFields);
    }
  };

  const openTicket = (reason: ZENDESK_TICKET_TYPES) => {
    if (!ticketReasons[reason]) {
      return console.warn(`No Zendesk ticket type found for reason: ${reason}`);
    }

    return openZendeskChat([
      { id: CR_CLASSIFICATION_ID, value: ticketReasons[reason] },
    ]);
  };

  return {
    openZendeskChat,
    openTicket,
  };
};
