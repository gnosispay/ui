"use client";

import { Tab } from "@headlessui/react";

import { useQuery } from "@tanstack/react-query";
import { classNames } from "@/lib/utils";

import { fetchApi } from "@/lib/api";
import TransactionsTable from "./visa-transactions";
import Erc20TransfersTable from "./erc-20-transfers";
import { BankTransfers } from "./bank-transfers";
import type {
  Erc20TokenEvent,
  Event,
  MoneriumIbanOrder,
} from "@gnosispay/types";

interface TransactionsTableTabsProps {
  erc20Transfers: Erc20TokenEvent[];
  ibanAvailable: boolean;
  moneriumIbanOrders: MoneriumIbanOrder[];
  currencyName?: string;
  tokenDecimals?: number;
}
const TransactionsTableTabs = ({
  erc20Transfers,
  ibanAvailable,
  moneriumIbanOrders,
  currencyName,
  tokenDecimals,
}: TransactionsTableTabsProps) => {
  const { data: transactions } = useQuery<Event[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await fetchApi("/transactions");
      return data;
    },
  });

  return (
    <Tab.Group>
      <Tab.List className="mt-6 text-center md:text-left">
        <Tab
          className={({ selected }) =>
            classNames(
              "w-[100px] md:w-[135px] h-[40px] text-gp-text-hc px-6 md:px-12 py-2 text-sm border border-text-gp-text-hc rounded-tl-lg rounded-bl-lg",
              selected &&
                "bg-stone-900 text-white focus:outline-none border-stone-900",
            )
          }
        >
          Card
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "w-[100px] md:w-[135px] h-[40px] text-gp-text-hc px-6 md:px-12 py-2 text-sm border border-text-gp-text-hc",
              selected &&
                "bg-stone-900 text-white focus:outline-none border-stone-900",
              !ibanAvailable && "rounded-tr-lg rounded-br-lg",
            )
          }
        >
          Wallet
        </Tab>
        {ibanAvailable && (
          <Tab
            className={({ selected }) =>
              classNames(
                "w-[100px] md:w-[135px] h-[40px] text-gp-text-hc px-6 md:px-12 py-2 text-sm rounded-tr-lg rounded-br-lg border border-text-gp-text-hc",
                selected &&
                  "bg-stone-900 text-white focus:outline-none border-stone-900",
              )
            }
          >
            Bank
          </Tab>
        )}
      </Tab.List>

      <Tab.Panels className="mt-2">
        <Tab.Panel>
          <TransactionsTable transactions={transactions} />
        </Tab.Panel>
        <Tab.Panel>
          <Erc20TransfersTable
            transactions={erc20Transfers}
            currencyName={currencyName}
            tokenDecimals={tokenDecimals}
          />
        </Tab.Panel>
        {ibanAvailable && (
          <Tab.Panel>
            <BankTransfers moneriumIbanOrders={moneriumIbanOrders} />
          </Tab.Panel>
        )}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default TransactionsTableTabs;
