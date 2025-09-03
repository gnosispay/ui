"use client";

import Image from "next/image";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useActivePartner } from "@/hooks/use-active-partner";

import Intercom from "@/components/intercom";
import Background from "../order/background.svg";
import type { ReactNode } from "react";

const intercomEnabled = process.env.NEXT_PUBLIC_ENABLE_INTERCOM === "true";

const SignupLayout = ({ children }: { children: ReactNode }) => {
  const activePartner = useActivePartner();

  return (
    <Intercom shouldInitialize={intercomEnabled}>
      <div className="h-screen flex justify-center bg-gp-bg-subtle">
        <div className="flex-1 py-8 px-6 space-y-8 flex flex-col">
          <div className="flex flex-row items-center">
            <Image
              src="/static/logo-black.svg"
              alt="Gnosis Pay"
              width={106}
              height={29}
            />

            {activePartner && (
              <>
                <X width={90} height={23} className="-mx-6" />

                <Image
                  src={activePartner.logoPath}
                  alt={activePartner.name}
                  width={106}
                  height={29}
                />
              </>
            )}
          </div>

          {children}
        </div>

        <div className="flex-1 h-full overflow-hidden relative hidden md:block">
          <Image src={Background} objectFit="cover" fill quality={100} alt="" />
        </div>
      </div>
    </Intercom>
  );
};

export default SignupLayout;
