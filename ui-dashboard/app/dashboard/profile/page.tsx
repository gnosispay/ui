import { User } from "@phosphor-icons/react/dist/ssr";

import { cookies } from "next/headers";
import MainContent from "@/components/layout/main-content";
import getUser from "@/lib/get-user";
import { getPaySafeAccounts } from "@/lib/pay-account-utils";
import { isIbanAvailable } from "@/lib/iban";
import Tabs from "./tabs";

export default async function Home() {
  const user = await getUser(cookies);

  const { safeAddress } = getPaySafeAccounts(user);

  const ibanAvailable = await isIbanAvailable(cookies);

  const userAddress =
    [
      user?.address1,
      user?.address2,
      user?.city,
      user?.state,
      user?.postalCode,
      user?.country,
    ]
      .filter(Boolean)
      .join("\n") || null;

  return (
    <MainContent>
      <div className="flex flex-col items-center lg:flex-row justify-between">
        <div className="flex flex-col gap-7 grow">
          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start">
              <User className="h-8 w-8 text-gp-icon-active" />
              Account
            </h1>
            <p className="text-gp-text-lc">
              Manage your personal details and account settings.
            </p>
          </div>

          <Tabs
            safeAddress={safeAddress}
            userAddress={userAddress}
            user={user}
            ibanAvailable={!!ibanAvailable}
          />
        </div>
      </div>
    </MainContent>
  );
}
