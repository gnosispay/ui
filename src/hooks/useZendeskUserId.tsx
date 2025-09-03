import { ZENDESK_PARTNER_TAG_VALUE, ZENDESK_USER_ID_FIELD_ID } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useState } from "react";
import { useZendesk } from "react-use-zendesk";

export const useZendeskUserId = () => {
  const { user } = useUser();
  const { isOpen, setConversationFields, setConversationTags } = useZendesk();
  const [isFielsdSet, setIsFielsdSet] = useState(false);

  useEffect(() => {
    if (!isOpen || isFielsdSet) {
      return;
    }

    if (user?.id) {
      setConversationFields([{ id: ZENDESK_USER_ID_FIELD_ID, value: user.id }]);
    }

    setConversationTags([ZENDESK_PARTNER_TAG_VALUE]);
    setIsFielsdSet(true);
  }, [user?.id, isOpen, isFielsdSet, setConversationFields, setConversationTags]);
};
