import type { ReactNode } from "react";

export const BannerWrap = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto w-full max-w-6xl p-7">{children}</div>;
};
