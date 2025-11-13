"use client";
import { IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFeatureFlagEnabled } from "posthog-js/react";
import Button from "../buttons/button";
import { BannerWrap } from "./_wrap";

export const RedoKycWarning = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isRedoKYCFeatureEnabled = useFeatureFlagEnabled("redo-kyc-warning");
  const posthogFeatureFlagsInitialized = typeof isRedoKYCFeatureEnabled !== "undefined";

  const pathname = usePathname();

  if (pathname.includes("/kyc")) {
    return null;
  }

  if (!posthogFeatureFlagsInitialized || !isRedoKYCFeatureEnabled) {
    return null;
  }
  
  function handleClick() {
    setLoading(true);
    router.push("/dashboard/kyc");
    setLoading(false);
  }

  return (
    <BannerWrap>
      <div className="bg-orange-100 relative p-4 rounded-md flex gap-3 border-2 border-orange-200">
        <div className="flex flex-col items-start gap-3">
          <IdentificationCard size={64} className="mb-4 text-lime-600/60" />
          <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
            ⚠️ Please update your KYC (Know Your Customer) verification
          </h2>
          <div className="text-stone-600 mt-2 text-sm">
            <strong>Action required:</strong> We regularly revise our{" "}
            <span className="italic">Know Your Customer</span> policies to be
            compliant with applicable regulations in our active jurisdictions.
            Please update your information immediately to continue using our services.
          </div>
          <Button
            onClick={handleClick}
            loading={loading}
            className="mt-3"
          >
            Update information
          </Button>
        </div>
      </div>
    </BannerWrap>
  );
};
