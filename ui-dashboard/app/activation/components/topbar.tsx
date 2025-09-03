import Image from "next/image";
import type { ReactNode } from "react";

export const TopBar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 sm:hidden justify-between">
      <Image
        src="/static/logo-simple-black.svg"
        alt="Gnosis Pay"
        width="40"
        height="40"
      />
      {children}
      <div className="flex-grow-0 flex-shrink-0">
        {/*<AccountButton compact />*/}
      </div>
    </div>
  );
};
