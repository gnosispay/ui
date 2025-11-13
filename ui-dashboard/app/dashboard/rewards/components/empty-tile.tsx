import type { ReactNode } from "react";

export const EmptyTile = ({
  icon,
  title,
  text,
  subtext,
  cta,
}: {
  icon: ReactNode;
  title: string;
  text: ReactNode;
  subtext: string;
  cta: ReactNode;
}) => {
  return (
    <div className="bg-white shadow-sm p-8 flex-1 flex-col flex rounded-lg text-center space-y-4">
      <div className="text-green-brand text-5xl flex justify-center">
        {icon}
      </div>
      <h1 className="text-xl mt-4 font-brand">{title}</h1>
      <div>{text}</div>
      <div className="text-green-brand-dark">{subtext}</div>
      <div className="flex-1"></div>
      <div className="flex items-center justify-center">{cta}</div>
    </div>
  );
};
