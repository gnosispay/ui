import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import Link from "next/link";
import { useState } from "react";
import { SUPPORTED_TOKENS } from "@gnosispay/tokens";
import { GNOSIS_CHAIN_ID } from "@/lib/constants";

export const ExternalExchangeButton = ({
  account,
  tokenSymbol,
}: {
  account: string;
  tokenSymbol: keyof typeof SUPPORTED_TOKENS;
}) => {
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);
  const ukDisclaimer = `The contents of this page serve solely for informational purposes and do not constitute advice whatsoever, or an endorsement or promotion of any third-party platforms or services, or of cryptoassets. In the event that you wish to bridge and swap your existing cryptoassets into Supported Funds, by clicking the link above, you will be directed to a third party bridge and swap aggregator. All transactions will be done directly through the third party’s platform. We are not responsible for and have no control over their platform and services. Hence, please conduct your own research, review their terms and policies carefully, and use their services at your own risk. We reserve the right to update, modify, or remove information on this page without prior notice.`;
  const ukDisclaimerShort = `${ukDisclaimer.slice(0, 140)}...`;

  const getExternalExchangeLink = () => {
    if (tokenSymbol === "EURe") {
      return (
        <Link
          href={`https://jumper.exchange?toChain=${GNOSIS_CHAIN_ID}&toToken=${SUPPORTED_TOKENS[tokenSymbol].address}&toAddress=${account}`}
          className="px-4 bg-gp-text-hc text-white flex rounded-xl items-center justify-center gap-2 focus:outline-none w-full py-4 mt-1 text-md"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowSquareOut className="font-bold -mr-1" />
          <span>Jumper.Exchange</span>
        </Link>
      );
    }

    return (
      <Link
        href={`https://swap.cow.fi/#/${GNOSIS_CHAIN_ID}/swap/_/${SUPPORTED_TOKENS[tokenSymbol].address}?recipient=${account}`}
        className="px-4 bg-gp-text-hc text-white flex rounded-xl items-center justify-center gap-2 focus:outline-none w-full py-4 mt-1 text-md"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ArrowSquareOut className="font-bold -mr-1" />
        <span>CoW Swap</span>
      </Link>
    );
  };

  return (
    <div className="space-y-4">
      {getExternalExchangeLink()}

      <div className="text-center">
        <a
          href="https://help.gnosispay.com/en/articles/8896057-how-to-get-eure-or-gbpe-on-gnosis-chain"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          See more options
        </a>
      </div>

      <div className="text-center mt-4">
        <div className={`relative`}>
          <p className="text-xs leading-4">
            {isDisclaimerExpanded ? (
              <>
                {ukDisclaimer}{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => setIsDisclaimerExpanded(false)}
                >
                  Read Less
                </span>
              </>
            ) : (
              <>
                {ukDisclaimerShort}{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => setIsDisclaimerExpanded(true)}
                >
                  Read More
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
