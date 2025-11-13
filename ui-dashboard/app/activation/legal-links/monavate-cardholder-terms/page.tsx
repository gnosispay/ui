import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import getUser from "@/lib/get-user";

const MonavateCardholderTerms = async () => {
  const user = await getUser(cookies);
  const country = user?.country;

  let monavateCardHolderTermsUrl =
    "https://legal.gnosispay.com/en/collections/7144607-gnosis-pay";

  if (country) {
    /**
     * User is signed in and the country is specified - we use country-specific links
     */
    const isUkOrSwitzerland = ["GB", "CH"].includes(country);

    monavateCardHolderTermsUrl = isUkOrSwitzerland
      ? "https://legal.gnosispay.com/en/articles/8911493-monavate-cardholder-terms-uk-switzerland"
      : "https://legal.gnosispay.com/en/articles/8911633-monavate-cardholder-terms-eea";
  }

  redirect(monavateCardHolderTermsUrl);
};

export default MonavateCardholderTerms;
