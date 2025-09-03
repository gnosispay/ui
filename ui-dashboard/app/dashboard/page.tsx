import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cookies } from "next/headers";
import Balance from "@/app/dashboard/(balances)/main-balance";
import MainContent from "@/components/layout/main-content";
import MoveFundsButton from "@/components/move-funds";
import getUser from "@/lib/get-user";
import formSalutation from "@/lib/salutation";
import TransactionsTableTabs from "@/components/transactions-table";
import { fetchErc20Transfers } from "@/lib/erc-20";
import { GoogleWalletCard } from "@/components/shared/google-wallet-card";
import { TransactionsInQueueWarning } from "@/components/transactions-in-queue-warning";
import { SafeIban } from "@/components/safe-iban";
import { isIbanAvailable } from "@/lib/iban";
import { getMoneriumIbanOrders } from "@/components/transactions-table/bank-transfers/actions";
import { getGoogleWalletCardData } from "@/components/shared/google-wallet-card/server";
import { InfoBanners } from "@/components/info-banners";
import { getPaySafeAccounts } from "../../lib/pay-account-utils";
import { getCards } from "./(cards)/cards/actions";
import BlockedCardWarning from "./(cards)/card/card-warnings/blocked-card-warnings";
import { getCardStatus } from "./(cards)/card/action";
import SafeConfigurationWarning from "./safe-configuration-warning";

export default async function Home() {
  const user = await getUser(cookies);

  const name =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name;

  const cards = await getCards();
  const hasAtLeastOneActiveCard = !!cards.find(
    (card) => card.activatedAt !== null,
  );
  const hasNoActiveCards = !hasAtLeastOneActiveCard;
  const showTransactionTable = hasAtLeastOneActiveCard;
  // FIXME: we're using the first card here
  const cardStatus = await getCardStatus(user?.cards[0]?.id);

  const {
    safeAddress: gnosisPayAccount,
    safeTokenData,
    currencyData,
  } = getPaySafeAccounts(user);

  const ibanAvailable = await isIbanAvailable(cookies);
  const ibanDetails = user?.BankingDetails;

  const erc20Transfers = gnosisPayAccount
    ? await fetchErc20Transfers({
        safeAddress: gnosisPayAccount,
        tokenAddress: safeTokenData?.address,
      })
    : [];

  const moneriumIbanOrders = ibanAvailable ? await getMoneriumIbanOrders() : [];
  const hasIncomingIbanOrders = moneriumIbanOrders?.some(
    (order) => order.kind === "issue",
  );
  const { isEligible: isGoogleWalletCardEligible } =
    await getGoogleWalletCardData();

  return (
    <MainContent>
      <pre className="hidden">{JSON.stringify(user, null, 2)}</pre>
      <div
        className={`flex flex-col gap-4 ${
          hasNoActiveCards ? "opacity-50" : ""
        }`}
      >
        {hasAtLeastOneActiveCard && gnosisPayAccount && (
          <Balance
            account={gnosisPayAccount}
            currencySymbol={currencyData?.symbol}
            currencyName={currencyData?.code}
            tokenAddress={safeTokenData?.address}
          />
        )}
        {hasAtLeastOneActiveCard && gnosisPayAccount && (
          <SafeConfigurationWarning
            account={gnosisPayAccount}
            tokenAddress={safeTokenData?.address}
          />
        )}

        {cardStatus?.isBlocked && <BlockedCardWarning />}

        <InfoBanners>
          {isGoogleWalletCardEligible && <GoogleWalletCard />}

          {ibanAvailable && (
            <SafeIban
              account={gnosisPayAccount!}
              name={name}
              hasIncomingIbanOrders={!!hasIncomingIbanOrders}
            />
          )}
        </InfoBanners>

        {/*
         * The 'TransactionsInQueueWarning' component shows and hides warnings based on account status changes.
         * We migrated the hiding/showing logic to the component directly since we use hooks to determine
         * if warnings should be displayed, which requires the usage of the client components.
         */}
        <TransactionsInQueueWarning account={gnosisPayAccount!} />

        <div className="flex flex-row gap-4 sm:gap-0 justify-between items-start pb-5 sm:pb-0">
          <div>
            <h2 className="text-2xl">
              {formSalutation()}
              {user?.name ? `, ${user.name}` : ""}
            </h2>
            <div className="flex gap-1 flex-wrap">
              <p className="text-gp-text-lc">
                These are your most recent transactions.
              </p>
              <a
                className="flex gap-1 items-center text-gp-text-lc border-b border-gp-border hover:text-black hover:border-black"
                href={`https://app.safe.global/transactions/history?safe=gno:${gnosisPayAccount}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="leading-none text-gp-text-lc whitespace-nowrap">
                  View all transactions here
                </p>
                <ArrowUpRight />
              </a>
            </div>
          </div>
          {gnosisPayAccount && (
            <MoveFundsButton
              currencyName={currencyData?.code}
              account={gnosisPayAccount}
              tokenAddress={safeTokenData?.address}
              country={user!.country}
              name={name!}
              ibanStatus={ibanDetails?.moneriumIbanStatus}
              iban={ibanDetails?.moneriumIban}
              bic={ibanDetails?.moneriumBic}
              ibanAvailable={ibanAvailable}
            />
          )}
        </div>

        {showTransactionTable && (
          <TransactionsTableTabs
            erc20Transfers={erc20Transfers}
            moneriumIbanOrders={moneriumIbanOrders || []}
            currencyName={currencyData?.code}
            tokenDecimals={safeTokenData?.decimals}
            ibanAvailable={ibanAvailable}
          />
        )}
      </div>
    </MainContent>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
