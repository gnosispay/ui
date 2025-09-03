import Image from "next/image";
import CardBackWithSVG from "@/components/card-details/card-back-with-background";
import {
  StepDescription,
  StepIndicator,
  StepTitle,
} from "../components/step-details";
import Card from "../components/card";
import { CardPanForm } from "./form";
import type { FC } from "react";

const ActivationStep: React.FC = () => (
  <div className="w-full relative flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <StepIndicator stepNumber={1} />
      <StepTitle>Link your card</StepTitle>
    </div>
    <StepDescription>
      Use the 16-digit number on the back of your card to link it to your
      wallet.
    </StepDescription>
  </div>
);
// ActivationPage component
const ActivationStart: FC = () => {
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
        {/* left */}
        <div className="">
          <div className="flex-1 flex justify-start flex-col">
            <ActivationStep />
            <Card className="p-8 min-w-[306px] max-w-[500px] w-full mt-8">
              <CardPanForm />
            </Card>
          </div>
        </div>
        {/* right */}
        <CardBackWithSVG />
      </div>
    </>
  );
};

export default ActivationStart;
