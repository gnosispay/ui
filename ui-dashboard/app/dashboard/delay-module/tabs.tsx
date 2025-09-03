"use client";

import { Tab } from "@headlessui/react";

import { classNames } from "@/lib/utils";

import ApprovalForm from "./forms/approval-form";
import RemovalForm from "./forms/removal-form";
import TransferForm from "./forms/transfer-form";

interface TabsProps {
  account: `0x${string}`;
}

const Tabs = ({ account }: TabsProps) => {
  return (
    <Tab.Group>
      <Tab.List className="mt-0 sm:mt-6 text-center">
        <Tab
          className={({ selected }) =>
            classNames(
              "w-42 h-[40px] text-gp-text-hc px-12 py-2 text-sm rounded-tl-lg rounded-bl-lg border border-text-gp-text-hc",
              selected &&
                "bg-stone-900 text-white focus:outline-none border-stone-900",
            )
          }
        >
          Token Approvals
        </Tab>

        <Tab
          className={({ selected }) =>
            classNames(
              "w-42 h-[40px] text-gp-text-hc px-12 py-2 text-sm border border-text-gp-text-hc",
              selected &&
                "bg-stone-900 text-white focus:outline-none border-stone-900",
            )
          }
        >
          Transfer Tokens
        </Tab>

        <Tab
          className={({ selected }) =>
            classNames(
              "w-42 h-[40px] text-gp-text-hc px-12 py-2 text-sm rounded-tr-lg rounded-br-lg border border-text-gp-text-hc",
              selected &&
                "bg-stone-900 text-white focus:outline-none border-stone-900",
            )
          }
        >
          Remove Safe Modules
        </Tab>
      </Tab.List>

      <Tab.Panels className="mt-2">
        <Tab.Panel>
          <div>
            <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start underline">
              Set token approvals
            </h1>
            <ApprovalForm account={account} />
          </div>
        </Tab.Panel>

        <Tab.Panel>
          <div>
            <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start underline">
              Transfer tokens
            </h1>
            <TransferForm account={account} />
          </div>
        </Tab.Panel>

        <Tab.Panel>
          <div>
            <div>
              <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start underline">
                Remove Safe Modules
              </h1>
              <RemovalForm account={account} />
            </div>
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;
