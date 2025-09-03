"use client";

import clsx from "clsx";
import CreditCardBack from "./gnosis-card-back";
import CreditCardFront from "./gnosis-card-front";

type CreditCardProps = {
  className?: string;
  name?: string | undefined;
};

export const CreditCardFrontBase = ({ className }: CreditCardProps) => {
  return <CreditCardFront className={clsx("aspect-cc-card ", className)} />;
};

export const GnosisPayCardFront = ({ className }: CreditCardProps) => {
  return (
    <CreditCardFrontBase
      className={clsx("rounded-xl drop-shadow-2xl", className)}
    />
  );
};

export const GnosisPayCardBack = ({ className, name }: CreditCardProps) => {
  return (
    <CreditCardBack
      className={clsx("aspect-cc-card rounded-xl ", className)}
      name={name}
    />
  );
};
