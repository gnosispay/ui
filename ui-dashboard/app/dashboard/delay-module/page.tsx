import { cookies } from "next/headers";

import { SUPPORTED_TOKENS } from "@gnosispay/tokens";
import { getGnosisAddressUrl } from "@/lib/constants";
import getUser from "@/lib/get-user";

import Tabs from "./tabs";
import type { TokenSymbol } from "@gnosispay/prisma/client";

export default async function Home() {
  const user = await getUser(cookies);

  const gnosisPayAccountData = user?.accounts.filter(
    (account: any) => account.type === "L1SAFE",
  );
  const safeTokenSymbol: TokenSymbol = gnosisPayAccountData?.[0]?.tokenSymbol;

  const token = SUPPORTED_TOKENS[safeTokenSymbol];
  const account = gnosisPayAccountData?.[0]?.address;

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full mb-0 md:mb-10 flex flex-col gap-4">
        <div>
          <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start">
            Delay Module
          </h1>
          <p className="text-gp-text-lc">
            Interact with the delay module of your Gnosis Pay Account Safe
          </p>
        </div>

        <div>
          <p>
            Your safe:{" "}
            <a
              className="underline"
              href={getGnosisAddressUrl(account)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {account}
            </a>
          </p>
          <p>
            Your card token:{" "}
            <a
              className="underline"
              href={getGnosisAddressUrl(token.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {token.address}
            </a>
          </p>
        </div>

        <Tabs account={gnosisPayAccountData?.[0]?.address as `0x${string}`} />
      </div>
    </>
  );
}
