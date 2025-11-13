import { Copy, Swap, Warning } from "@phosphor-icons/react/dist/ssr";

import { isEUOrSwiss } from "@gnosispay/countries";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { useViewport } from "@/hooks/use-viewport";
import { shortenAddress } from "@/lib/utils";
import Button from "../../buttons/button";
import { ExternalExchangeButton } from "../../buttons/external-exchange-button";
import Divider from "../../divider";
import { AddTokensDialogTab } from "./types";
import type { TokenSymbol } from "@gnosispay/prisma/client";

export const DetailsTab = ({
  country,
  changeTab,
  account,
  tokenSymbol = "EURe",
}: {
  country: string;
  changeTab: (tab: AddTokensDialogTab) => void;
  account: `0x${string}`;
  tokenSymbol?: string;
}) => {
  const { isMobile } = useViewport();
  const [, copy] = useClipboardCopy({ showToast: true });

  return (
    <div className="p-6">
      <div className="rounded-lg bg-[#FAF8F3] flex justify-between px-5 py-2.5">
        <div>
          <div className="text-stone-900 font-semibold">Wallet address</div>
          <div className="text-stone-400 text-xs">
            {isMobile ? shortenAddress(account, 10, 10) : account}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="rounded-full bg-[#F1ECDF] h-10 w-10 p-2.5 flex items-center hover:opacity-60"
            onClick={() => copy(account)}
          >
            <Copy className="w-full" />
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 p-4 mt-6 border border-amber-100 ">
        <div className="flex">
          <div className="flex-shrink-0">
            <Warning className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-stone-900">
              Please only deposit {tokenSymbol} on Gnosis Chain, this is solely
              your responsibility. If you deposit on another network, your
              assets may be lost.
            </h3>
          </div>
        </div>
      </div>

      <Divider>OR</Divider>

      {isEUOrSwiss(country) ? (
        <>
          <div className="flex flex-col gap-3">
            <div className="text-sm text-center text-gp-text-hc ">
              <p className="leading-4 mb-0">
                Get {tokenSymbol} on Gnosis Chain through deBridge below
              </p>

              <a
                href="https://help.gnosispay.com/en/articles/8896057-how-to-get-eure-or-gbpe-on-gnosis-chain"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                See more options
              </a>
            </div>

            <Button
              onClick={() => changeTab(AddTokensDialogTab.Swap)}
              className="w-full py-4"
            >
              <Swap className="text-stone-500 h-5" />
              <span className="text-stone-50">
                Get {tokenSymbol} with deBridge
              </span>
            </Button>

            <div className="mt-4">
              <p className="text-center text-sm text-secondary">
                By proceeding, you acknowledge that the service is provided by
                third parties and that you are entering into the{" "}
                <a
                  href="https://docs.debridge.finance/legal/sdk-and-api-license-agreement"
                  target="_blank"
                  className="underline hover:text-primary"
                  rel="noopener noreferrer"
                >
                  deBridge SDK and API License Agreement
                </a>{" "}
                and applicable third-party terms. Please conduct your own
                research and use at your own risk.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-center text-gp-text-hc ">
            <p className="leading-4 mb-0">
              You can get {tokenSymbol} on Gnosis chain via CoW Swap. By
              clicking the link below, you will be redirected to their website.
            </p>
          </div>
          <ExternalExchangeButton
            account={account}
            tokenSymbol={tokenSymbol as TokenSymbol}
          />
        </div>
      )}
    </div>
  );
};
