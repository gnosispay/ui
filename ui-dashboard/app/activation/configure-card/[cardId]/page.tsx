import Image from "next/image";

import { cookies } from "next/headers";
import CardFrontWithSVG from "@/components/card-details/card-front-with-background";
import getUser from "@/lib/get-user";
import {
  StepDescription,
  StepIndicator,
  StepTitle,
} from "../../components/step-details";
import Card from "../../components/card";
import CardActivationWithoutPin from "./form";
import type { FC } from "react";

const ActivationStep: React.FC = () => (
  <div className="w-full relative flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <StepIndicator stepNumber={3} />
      <StepTitle>{"Activate your card!"}</StepTitle>
    </div>
    <StepDescription>{`Spending with crypto is just one step away.`}</StepDescription>
  </div>
);

const ConfigureCard: FC = async () => {
  const user = await getUser(cookies);

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
        </div>{" "}
        {/* left */}
        <div className="">
          <div className="flex-1 flex justify-start flex-col">
            <ActivationStep />
            <Card className="p-8 min-w-[306px] max-w-[500px] w-full mt-8">
              <CardActivationWithoutPin userCountry={user?.country} />
            </Card>
          </div>
        </div>
        {/* right */}
        <CardFrontWithSVG />
      </div>
    </>
  );
};

export default ConfigureCard;
