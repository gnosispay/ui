import Image from "next/image";
import AccountButton from "@/components/account/account-button";
import type { ReactNode } from "react";

export const SideBar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-64 min-h-screen h-full fixed bg-white border-r border-stone-200 overflow-hidden pl-8 pt-12 hidden sm:block">
      <div className="flex h-full flex-col gap-y-7">
        <Image
          src="/static/logo-black.svg"
          className="mb-12"
          alt="Gnosis Pay"
          width="106"
          height="29"
        />
        {children}
        <div className="-mx-6 mt-auto border-t border-gray-200">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};
