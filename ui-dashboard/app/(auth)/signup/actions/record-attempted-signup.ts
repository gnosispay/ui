"use server";

import sgClient from "@sendgrid/client";
import { SENDGRID_ATTEMPTED_SIGNUP_CONTACT_LIST_ID } from "../../../../lib/constants";

if (process.env.SENDGRID_SECRET) {
  sgClient.setApiKey(process.env.SENDGRID_SECRET);
}

export const recordAttemptedSignup = async ({
  email,
  country,
}: {
  email: string;
  country: string;
}) => {
  "use server";

  try {
    await sgClient.request({
      method: "PUT",
      url: "/v3/marketing/contacts",
      body: {
        list_ids: [SENDGRID_ATTEMPTED_SIGNUP_CONTACT_LIST_ID],
        contacts: [{ email, country }],
      },
    });
    return true;
  } catch (e) {
    console.error(e);
  }
};
