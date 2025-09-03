"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const { push } = useRouter();

  /**
   * This component doesn't render anything and is used only for redirecting
   * to the correct KYC URL.
   *
   * We used to handle which KYC provider to redirect to from here, however,
   * we are now hardcoding to redirect to Sumsub.
   *
   * We should still keep this page as we might have shared this URL with some
   * of the users.
   *
   * Also, we might need to handle some top-level marketing events dispatching from here,
   * so we are keeping this component for now.
   */
  push("/order/verify/kyc/sumsub");

  return null;
}
