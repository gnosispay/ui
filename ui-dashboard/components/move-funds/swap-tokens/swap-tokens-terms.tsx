import Image from "next/image";
import Button from "@/components/buttons/buttonv2";
import { SwapProvider } from "./types";

interface SwapTokensTermsProps {
  provider: SwapProvider;
  tokenName: string;
  onAccept: () => void;
  onBack?: () => void;
  backEnabled?: boolean;
}

export const SwapTokensTerms = ({
  provider,
  tokenName,
  onAccept,
  onBack,
  backEnabled = true,
}: SwapTokensTermsProps) => {
  return (
    <div className="items-center flex flex-col justify-center gap-4">
      <Image
        src={
          provider === SwapProvider.LiFi
            ? "/static/lifi-logo.svg"
            : "/static/debridge-logo.svg"
        }
        alt={provider === SwapProvider.LiFi ? "Li-Fi Logo" : "DeBridge Logo"}
        width="40"
        height="40"
      />
      <h3 className="text-black">
        Swap and bridge tokens to {tokenName} using{" "}
        {provider === SwapProvider.LiFi ? "LI.FI" : "deBridge"}
      </h3>
      <p className="text-center text-sm text-secondary">
        {provider === SwapProvider.LiFi ? (
          <>
            All bridge and swap services are provided independently by LI.FI
            Service GmbH and relevant third party service providers. By
            proceeding you acknowledge that you are entering into the{" "}
            <a
              href="https://li.fi/legal/terms-and-conditions/"
              target="_blank"
              className="underline hover:text-primary"
              rel="noopener noreferrer"
            >
              LI.FI T&Cs
            </a>{" "}
            and applicable third party terms.
          </>
        ) : (
          <>
            By proceeding, you acknowledge that the service is provided by third
            parties and that you are entering into the{" "}
            <a
              href="https://docs.debridge.finance/legal/sdk-and-api-license-agreement"
              target="_blank"
              className="underline hover:text-primary"
              rel="noopener noreferrer"
            >
              deBridge SDK and API License Agreement
            </a>{" "}
            and applicable third-party terms.
          </>
        )}{" "}
        Please conduct your own research and use at your own risk.
      </p>
      <div className="space-y-2 flex flex-col w-full">
        <Button onClick={onAccept} className="w-full">
          Continue
        </Button>
        {backEnabled && (
          <Button
            onClick={onBack}
            className="w-full bg-transparent text-black underline"
          >
            See more options
          </Button>
        )}
      </div>
    </div>
  );
};
