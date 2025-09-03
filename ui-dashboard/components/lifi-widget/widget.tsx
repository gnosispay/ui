import { useMemo } from "react";

import { LiFiWidget } from "@lifi/widget";
import { ChainType } from "@lifi/sdk";
import { useModal } from "connectkit";
import type { WidgetConfig } from "@lifi/widget";

const INTEGRATOR = "gnosis-pay";

export interface WidgetProps {
  toAddress: string;
  tokenAddress: string;
  chainId: number;
}

export const Widget = ({ toAddress, tokenAddress, chainId }: WidgetProps) => {
  const { openProfile } = useModal();

  const config = useMemo(
    (): WidgetConfig => ({
      languageResources: {
        en: {
          header: { exchange: "Bridge/Swap tokens with LI.FI" },
        },
      },
      languages: {
        allow: ["en"],
        default: "en",
      },
      integrator: INTEGRATOR,
      toChain: chainId,
      toToken: tokenAddress,
      toAddress: { address: toAddress, chainType: ChainType.EVM },
      theme: {
        container: {
          width: "100%",
          maxWidth: "100%",
          padding: "0",
        },
        palette: {
          primary: { main: "#21201C" },
          secondary: { main: "#CDDF52" },
        },
        typography: {
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        },
      },
      appearance: "light",
      hiddenUI: ["appearance", "walletMenu"],
      disabledUI: ["toToken", "toAddress"],
      walletConfig: {
        onConnect: openProfile,
      },
    }),
    [toAddress, tokenAddress, chainId, openProfile],
  );

  return <LiFiWidget integrator={INTEGRATOR} config={config} />;
};
