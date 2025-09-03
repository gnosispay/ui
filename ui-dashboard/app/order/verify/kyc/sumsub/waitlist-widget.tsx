"use client";
import { useEffect, useState } from "react";
import { COUNTRIES, SUPPORTED_COUNTRIES } from "@gnosispay/countries";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { WaitlistModal } from "@/app/(auth)/signup/components/waitlist-modal";
import getUser from "@/lib/get-user";
import { SumsubWidget } from "./widget";

export const SumsubWaitlistWidget = ({
  accessToken,
  userId,
}: {
  accessToken: string;
  userId: string;
}) => {
  const { push } = useRouter();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const { data: user, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(),
  });

  const selectedCountry = COUNTRIES.find(
    (country) => country.alpha2 === user?.country,
  );

  const handleSuccess = async () => {
    /*
        Because we are relying on Sumsub workflow to reject user based on their country,
        we need to wait for Sumsub to process the user and update our database.
        We'll keep checking until the processing status is done.
    */
    let processingComplete = false;

    while (!processingComplete) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const refreshedUser = await refetch();

      if (refreshedUser.data?.kycProviders[0]?.processingStatus === "done") {
        processingComplete = true;

        if (refreshedUser.data?.kycProviders[0].approved) {
          push("/order/verify/source-of-funds");
        }
      }
    }
  };

  const handleReject = () => {
    refetch();
  };

  const isBrazilEnabled = useFeatureFlagEnabled("brazil-cards-pilot");
  const featureFlagsInitialized = typeof isBrazilEnabled !== "undefined";

  useEffect(() => {
    const supportedCountries = [
      ...SUPPORTED_COUNTRIES,
      featureFlagsInitialized && isBrazilEnabled && "BR",
    ].filter(Boolean);

    if (user?.country && !supportedCountries.includes(user.country)) {
      setIsWaitlistOpen(true);
    }
  }, [user?.country, isBrazilEnabled, featureFlagsInitialized]);

  return (
    <>
      <SumsubWidget
        accessToken={accessToken}
        onSuccess={handleSuccess}
        onReject={handleReject}
      />
      {selectedCountry && user?.email && (
        <WaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          selectedCountry={selectedCountry}
          email={user.email}
        />
      )}
    </>
  );
};
