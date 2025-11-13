import type { ReactNode } from "react";

export const Tile = ({
  icon,
  title,
  children,
  cta,
  moreLink,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  cta: ReactNode;
  moreLink?: ReactNode;
}) => {
  return (
    <div className="bg-white shadow-sm flex-1 flex-col flex rounded-lg">
      <div className="border-b flex justify-between items-center p-4">
        <div className="flex space-x-2 items-center">
          <div className="text-green-brand text-2xl flex justify-center">
            {icon}
          </div>
          <h1 className="text-lg">{title}</h1>
        </div>
        {moreLink}
      </div>
      <div className="p-4 py-6">{children}</div>
      <div className="flex-1"></div>
      <div className="flex items-center justify-center p-4">{cta}</div>
    </div>
  );
};
