import React from "react";
import Link from "next/link";
import { GnosisPayCardFront } from "@/app/activation/lib/gnosis-pay-card";
import type { Card } from "./types";

const CardListItem = ({ card }: { card: Card }) => {
  return (
    <Link href={`/dashboard/card/${card.id}`}>
      <div className="flex w-full items-center gap-8 hover:bg-gp-sand odd:bg-white p-4 rounded-md">
        <div className="transform rotate-90 w-[54px] opacity-80 ml-3">
          <GnosisPayCardFront />
        </div>
        <div>
          <div>
            <div className="text-sm text-gp-text-hc">Card</div>
          </div>

          <div className={"flex items-center"}>
            <div className="text-lg">&#8226;</div>
            <div className="text-lg">&#8226;</div>
            <div className="">{card.lastFourDigits}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const CardList = ({ cards }: { cards: Card[] }) => {
  return (
    <div className="max-w-2xl m-auto">
      <div className="-my-2 overflow-scroll md:overflow-visible sm:-mx-6 lg:-mx-8 pb-16 md:pb-0 scrollbar-hidden">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Cards</h1>
          </div>
          <div className="flex w-full flex-col gap-2 m-auto ">
            {cards.map((card) => (
              <CardListItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
