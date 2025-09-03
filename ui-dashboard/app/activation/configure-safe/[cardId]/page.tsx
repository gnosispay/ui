"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle } from "@phosphor-icons/react/dist/ssr";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import CardFrontWithSVG from "@/components/card-details/card-front-with-background";
import SiweButton from "@/components/buttons/siwe-button";
import Spinner from "@/components/spinner";
import Card from "../../components/card";
import {
  StepDescription,
  StepIndicator,
  StepTitle,
} from "../../components/step-details";
import ExplanationVideo from "./explanation-video";
import type { FC } from "react";

const ConfigureSafeForm = dynamic(() => import("./form"), { ssr: false });

const ConfigureSafeStep: FC = () => (
  <div className="w-full flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <StepIndicator stepNumber={2} />
      <StepTitle>{"Setup your Safe"}</StepTitle>
    </div>
    <StepDescription>
      Configure your Safe to allow your card to spend.
    </StepDescription>
  </div>
);

const SafeSetupDescription: FC = () => (
  <div>
    <div className="w-96 text-stone-800 text-base font-semibold">
      Safe set up
    </div>
    <div className="w-96 text-stone-600 text-base font-normal">
      Before using your card, set up your Safe to enable spending from it.
    </div>
  </div>
);

interface VideoPlayButtonProps {
  openSafeInstructions: () => void;
}
const VideoPlayButton: FC<VideoPlayButtonProps> = ({
  openSafeInstructions,
}) => (
  <button
    className="px-2 py-1 bg-[#F0EBDE] rounded inline-flex items-center gap-1 max-w-max"
    onClick={openSafeInstructions}
  >
    <PlayCircle className="w-6 h-6 text-lime-600" />
    <div className="text-lime-900 text-sm font-semibold ">Play video</div>
  </button>
);

interface VideoSectionProps {
  openSafeInstructions: () => void;
}
const VideoSection: FC<VideoSectionProps> = ({ openSafeInstructions }) => (
  <div className="bg-orange-50 p-3 rounded-md flex flex-col gap-3">
    <div className="flex gap-1">
      <div className="text-stone-800 text-sm font-semibold">Watch:</div>
      <div className="text-stone-800 text-sm font-normal">
        What’s happening under the hood?
      </div>
    </div>

    <div className="flex gap-3">
      <VideoPlayButton openSafeInstructions={openSafeInstructions} />
    </div>
  </div>
);

const ConfigureSafe: FC = () => {
  const [explanationVideoOpen, setExplanationVideoOpen] =
    useState<boolean>(false);

  const session = useSession();

  const isSessionLoading = session.status === "loading";
  const hasSIWE = !!session?.data?.user?.siweAddress;

  return (
    <>
      <div className="flex flex-col md:flex-row h-full w-full justify-around p-4 sm:p-10 md:p-24 gap-4">
        <div className=" sm:hidden flex justify-center my-8">
          <Image
            src="/static/logo-black.svg"
            alt="Gnosis Pay"
            width="106"
            height="29"
          />
        </div>
        <div className="">
          <ConfigureSafeStep />
          <div className="mt-8">
            <Card className="py-4 px-4 min-w-[306px] ">
              <div className="sm:flex sm:gap-3 sm:px-3">
                <div className="flex-1">
                  <Image
                    src="/static/safe-logo.svg"
                    className="mb-auto"
                    width={54}
                    height={54}
                    alt="Safe Logo"
                  />
                </div>
                <div className="flex-2">
                  <SafeSetupDescription />
                  <VideoSection
                    openSafeInstructions={() => setExplanationVideoOpen(true)}
                  />
                  <div className="flex mt-3 justify-end">
                    {!isSessionLoading && hasSIWE && <ConfigureSafeForm />}
                    {!isSessionLoading && !hasSIWE && <SiweButton />}
                    {isSessionLoading && (
                      <div className="flex items-center justify-center">
                        <Spinner monochromatic className="w-4 h-4 mr-2" />
                        <span>Checking session...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <CardFrontWithSVG />
      </div>
      <ExplanationVideo
        isOpen={explanationVideoOpen}
        handleClose={() => setExplanationVideoOpen(false)}
      />
    </>
  );
};

export default ConfigureSafe;
