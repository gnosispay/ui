"use server";

import sgClient from "@sendgrid/client";
import {
  SENDGRID_WAITLIST_CONTACT_LIST_ID,
  LOOPS_API_KEY,
  LOOPS_UPDATE_CONTACT_API_ENDPOINT,
  LOOPS_WAITLIST_MAILING_LIST_ID,
} from "../../../../lib/constants";

if (process.env.SENDGRID_SECRET) {
  sgClient.setApiKey(process.env.SENDGRID_SECRET);
}

export type WaitlistFormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

export const joinWaitlist = async (
  { firstName, lastName, email }: WaitlistFormValues,
  country: string,
) => {
  "use server";

  try {
    await sgClient.request({
      method: "PUT",
      url: "/v3/marketing/contacts",
      body: {
        list_ids: [SENDGRID_WAITLIST_CONTACT_LIST_ID],
        contacts: [
          {
            email,
            first_name: firstName,
            last_name: lastName,
            country,
          },
        ],
      },
    });

    if (LOOPS_API_KEY) {
      await fetch(LOOPS_UPDATE_CONTACT_API_ENDPOINT, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${LOOPS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          country,
          mailingLists: {
            [LOOPS_WAITLIST_MAILING_LIST_ID]: true,
          },
        }),
      });
    } else {
      console.error("LOOPS_API_KEY is not set");
    }

    return true;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to join waitlist");
  }
};
