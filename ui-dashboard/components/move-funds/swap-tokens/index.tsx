import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import Dialog from "@/components/dialog";
import { DebridgeWidget } from "@/components/debridge-widget";
import LifiWidget from "@/components/lifi-widget";
import { GNOSIS_CHAIN_ID } from "@/lib/constants";
import { SwapTokensTerms } from "./swap-tokens-terms";
import { SwapProvider } from "./types";

interface SwapModalProps {
  safeAddress: string;
  tokenAddress: string;
  tokenName: string;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  backEnabled?: boolean;
  provider?: SwapProvider;
}

export const SwapModal = ({
  safeAddress,
  tokenAddress,
  tokenName,
  isOpen,
  onClose,
  onBack,
  backEnabled = true,
  provider = SwapProvider.deBridge,
}: SwapModalProps) => {
  const [acceptedProviders, setAcceptedProviders] = useState<
    Record<SwapProvider, boolean>
  >({
    [SwapProvider.deBridge]: false,
    [SwapProvider.LiFi]: false,
  });

  if (!safeAddress) {
    return <div>Safe address not found</div>;
  }

  const handleAcceptProvider = () => {
    setAcceptedProviders((prev) => ({ ...prev, [provider]: true }));
  };

  const getProviderContent = () => {
    if (!acceptedProviders[provider]) {
      return (
        <SwapTokensTerms
          provider={provider}
          tokenName={tokenName}
          onAccept={handleAcceptProvider}
          onBack={onBack}
          backEnabled={backEnabled}
        />
      );
    }

    return provider === SwapProvider.LiFi ? (
      <LifiWidget
        toAddress={safeAddress}
        chainId={GNOSIS_CHAIN_ID}
        tokenAddress={tokenAddress}
      />
    ) : (
      <DebridgeWidget
        toAddress={safeAddress}
        chainId={GNOSIS_CHAIN_ID}
        tokenAddress={tokenAddress}
      />
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl bg-bg-secondary"
      absolutelyCentered
    >
      <div>
        <div className="border-b border-stone-200 p-6 relative">
          {backEnabled && (
            <CaretLeft
              onClick={onBack}
              className="cursor-pointer text-xl absolute top-7 left-6"
            />
          )}
          <h3 className="text-lg text-center">Swap tokens</h3>
        </div>
        <div className="space-y-4 flex-col p-6">{getProviderContent()}</div>
      </div>
    </Dialog>
  );
};
