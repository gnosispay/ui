"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/buttons/buttonv2";
import { Partner, PARTNER_CONFIG, PartnerStatus } from "@/lib/constants";
import Background from "../../order/background.svg";

const ChoosePartnerPage = () => {
  const router = useRouter();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const handlePartnerSelect = (partner: Partner) => {
    if (PARTNER_CONFIG[partner].status !== PartnerStatus.ACTIVE) {
      return;
    }
    setSelectedPartner(partner);
  };

  const handlePartnerContinue = () => {
    if (!selectedPartner) {
      return;
    }

    const partnerConfig = PARTNER_CONFIG[selectedPartner];
    if (partnerConfig.external) {
      window.location.href = partnerConfig.activationUrl;
    } else {
      router.push(partnerConfig.activationUrl);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gp-bg-subtle">
      {/* Left side - content */}
      <div className="flex-1 py-8 px-6 md:px-12 space-y-8 flex flex-col">
        <div className="flex items-center">
          <Image
            src="/static/logo-black.svg"
            alt="Gnosis Pay"
            width={106}
            height={29}
          />
        </div>

        <div className="flex flex-col flex-1 justify-center max-w-md mx-auto w-full -mt-10">
          <h1 className="text-3xl font-brand mb-3 text-center">
            Select a partner to activate your card
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Please select the provider you signed up with
          </p>

          <div className="space-y-0 mb-8 bg-white rounded-lg shadow-sm">
            {/* Picnic option */}
            <div
              className="p-5 border-b flex items-center cursor-pointer gap-2.5"
              onClick={() => handlePartnerSelect(Partner.PICNIC)}
            >
              <div className="w-12 h-12 rounded-full bg-white flex-shrink-0 overflow-hidden mr-4 flex items-center justify-center border border-gray-200">
                <Image
                  src="/static/picnic-logo.png"
                  alt="Picnic"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </div>
              <span className="font-medium text-black">
                {PARTNER_CONFIG[Partner.PICNIC].name}
              </span>
              <div className="ml-auto">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                  {selectedPartner === Partner.PICNIC && (
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Zeal option */}
            <div
              className="p-5 border-b flex items-center cursor-pointer gap-2.5"
              onClick={() => handlePartnerSelect(Partner.ZEAL)}
            >
              <div className="w-12 h-12 rounded-full bg-white flex-shrink-0 overflow-hidden mr-4 flex items-center justify-center border border-gray-200">
                <Image
                  src="/static/zeal-logo.png"
                  alt="Zeal"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </div>
              <span className="font-medium text-black">
                {PARTNER_CONFIG[Partner.ZEAL].name}
              </span>
              <div className="ml-auto">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                  {selectedPartner === Partner.ZEAL && (
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Greenhood option */}
            <div
              className="p-5 border-b flex items-center cursor-pointer gap-2.5"
              onClick={() => handlePartnerSelect(Partner.GREENHOOD)}
            >
              <div className="w-12 h-12 rounded-full bg-white flex-shrink-0 overflow-hidden mr-4 flex items-center justify-center border border-gray-200">
                <Image
                  src="/static/greenhood-logo.svg"
                  alt="Greenhood"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </div>
              <span className="font-medium text-black">
                {PARTNER_CONFIG[Partner.GREENHOOD].name}
              </span>
              <div className="ml-auto">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                  {selectedPartner === Partner.GREENHOOD && (
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Metri option */}
            <div
              className="p-5 flex items-center cursor-pointer gap-2.5"
              onClick={() => handlePartnerSelect(Partner.METRI)}
            >
              <div className="w-12 h-12 rounded-full bg-white flex-shrink-0 overflow-hidden mr-4 flex items-center justify-center border border-gray-200">
                <Image
                  src="/static/metri-logo.png"
                  alt="Metri"
                  width={48}
                  height={48}
                  className="rounded-full object-contain"
                />
              </div>
              <span className="font-medium text-black">
                {PARTNER_CONFIG[Partner.METRI].name}
              </span>
              <div className="ml-auto">
                <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                  {selectedPartner === Partner.METRI && (
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePartnerContinue}
            disabled={!selectedPartner}
            className={`w-full py-3 rounded-lg text-white ${!selectedPartner ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {selectedPartner
              ? `Continue with ${PARTNER_CONFIG[selectedPartner].name}`
              : "Select partner"}
          </Button>

          <div className="flex items-center justify-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <Link href="/activation/start">
            <Button className="w-full py-3 rounded-lg text-white">
              Continue with Gnosis Pay
            </Button>
          </Link>
        </div>
      </div>

      {/* Right side - light green background with wave pattern (only on desktop) */}
      <div className="hidden md:block flex-1 relative bg-green-brand overflow-hidden">
        <Image
          src={Background}
          alt="Background pattern"
          fill
          quality={100}
          style={{
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      </div>
    </div>
  );
};

export default ChoosePartnerPage;
