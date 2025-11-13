import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { DebridgeWidget } from "@/components/debridge-widget";
import { AddTokensDialogTab } from "./types";

interface SwapTabProps {
  changeTab: (tab: AddTokensDialogTab) => void;
  account: string;
  tokenAddress: `0x${string}`;
}

export const SwapTab = ({ changeTab, account, tokenAddress }: SwapTabProps) => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <button
        className="flex items-center gap-2"
        onClick={() => changeTab(AddTokensDialogTab.Details)}
      >
        <ArrowLeft /> Back
      </button>

      <DebridgeWidget
        toAddress={account}
        tokenAddress={tokenAddress}
        chainId={100}
      />
      <div className="-mt-4 px-8">
        <p className="text-xs leading-4 text-gp-text-lc text-center">
          By proceeding, you acknowledge that the service is provided by third
          parties and that you are entering into the{" "}
          <a
            href="https://docs.debridge.finance/legal/sdk-and-api-license-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            deBridge SDK and API License Agreement
          </a>{" "}
          and applicable third-party terms. Please conduct your own research and
          use at your own risk.
        </p>
      </div>
    </div>
  );
};
