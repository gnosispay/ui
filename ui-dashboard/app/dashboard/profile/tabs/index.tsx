"use client";

import { Tab } from "@headlessui/react";
import { classNames } from "@/lib/utils";
import Profile from "./profile";
import AccountDetails from "./account-details";
import Settings from "./settings";
import type { Me } from "@/lib/get-user";

interface TabsProps {
  safeAddress?: `0x${string}`;
  userAddress: string | null;
  user: Me | null;
  ibanAvailable: boolean;
}
const Tabs = ({ safeAddress, userAddress, user, ibanAvailable }: TabsProps) => {
  const name =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name;

  return (
    <Tab.Group>
      <Tab.List className="text-center lg:text-left border-b-[1px] flex justify-between md:justify-start gap-0 md:gap-4">
        <Tab
          className={({ selected }) =>
            classNames(
              "h-[40px] text-gp-text-hc py-2 px-4 text-md text-center",
              selected &&
                "focus:outline-none border-b-[2px] border-green-brand font-medium",
            )
          }
        >
          Profile
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "h-[40px] text-gp-text-hc py-2 px-4 text-md text-center",
              selected &&
                "focus:outline-none border-b-[2px] border-green-brand font-medium",
            )
          }
        >
          Account details
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "h-[40px] text-gp-text-hc py-2 px-4 text-md text-center",
              selected &&
                "focus:outline-none border-b-[2px] border-green-brand font-medium",
            )
          }
        >
          Settings
        </Tab>
      </Tab.List>

      <Tab.Panels className="mt-2">
        <Tab.Panel className="focus:outline-none">
          <Profile userAddress={userAddress} user={user} />
        </Tab.Panel>

        <Tab.Panel className="focus:outline-none">
          <AccountDetails
            safeAddress={safeAddress}
            name={name}
            ibanAvailable={ibanAvailable}
          />
        </Tab.Panel>

        <Tab.Panel className="focus:outline-none">
          <Settings user={user} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;
