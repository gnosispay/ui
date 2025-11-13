import { CreditCard } from "@phosphor-icons/react/dist/ssr";

import { cookies } from "next/headers";
import MainContent from "@/components/layout/main-content";
import getUser from "@/lib/get-user";
import CardSettings from "./card-settings";
import CardViewer from "./card-viewer";
import { getCardStatus, getCardType } from "./action";
import StolenCardWarning from "./card-warnings/stolen-card-warning";
import LostCardWarning from "./card-warnings/lost-card-warning";
import BlockedCardWarning from "./card-warnings/blocked-card-warnings";

export default async function CardDetailsAndSettings({
  cardId,
}: {
  cardId: string;
}) {
  const user = await getUser(cookies);
  const status = (await getCardStatus(cardId)) || {};
  const type = (await getCardType(cardId)) || {};
  const isVirtual = type.isVirtual || false;

  const disableSettings =
    status.isStolen ||
    status.isLost ||
    status.isBlocked ||
    status.isVoid ||
    status.activatedAt === null ||
    !cardId;
  const isCardFrozen = status.isFrozen || status.isBlocked || status.isVoid;

  return (
    <MainContent className="relative">
      <div className="flex flex-col items-center lg:flex-row justify-between gap-10">
        <div className="flex flex-col gap-8 lg:w-[55%]">
          <div className="flex flex-wrap gap-2"></div>

          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h1 className="flex gap-3 items-center text-2xl justify-center lg:justify-start">
              <CreditCard className="h-8 w-8 text-gp-icon-active" />
              Card details and settings
            </h1>
            <p className="text-gp-text-lc">
              Manage your card preferences and security settings.
            </p>
          </div>
          {status.isStolen && <StolenCardWarning />}
          {status.isLost && <LostCardWarning />}
          {status.isBlocked && <BlockedCardWarning />}

          <div
            className={disableSettings ? "opacity-50 pointer-events-none" : ""}
          >
            <CardSettings
              cardId={cardId}
              isFrozen={isCardFrozen}
              isVirtual={isVirtual}
            />
          </div>
        </div>
        <CardViewer cardId={cardId} name={user?.name} />
      </div>
    </MainContent>
  );
}
