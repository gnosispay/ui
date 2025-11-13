import React from "react";
import type { FC } from "react";

type ContainerProps = {
  children: React.ReactNode;
};

type OuterContainerProps = ContainerProps;
type InnerContainerProps = ContainerProps;

const CardOuter: FC<OuterContainerProps> = ({ children }) => (
  <div className="flex min-w-[300px] max-w-[400px] flex-col justify-center gap-10 rounded-2xl bg-gp-dust p-8">
    {children}
  </div>
);

const CardInner: FC<InnerContainerProps> = ({ children }) => (
  <div className="flex flex-col gap-6 self-stretch rounded-lg bg-white-800 p-8">
    {children}
  </div>
);

const Card: FC<ContainerProps> = ({ children }) => (
  <CardOuter>
    <CardInner>{children}</CardInner>
  </CardOuter>
);

export default Card;
