import { useCallback, useMemo } from "react";
import Script from "next/script";

import { DEBRIDGE_WIDGET_URL, generateDebridgeConfig } from "./config";

interface DebridgeWidgetProps {
  toAddress: string;
  tokenAddress: string;
  chainId: number;
}

export const DebridgeWidget = ({
  toAddress,
  tokenAddress,
  chainId,
}: DebridgeWidgetProps) => {
  const debridgeConfig = useMemo(
    () => generateDebridgeConfig({ toAddress, tokenAddress, chainId }),
    [toAddress, tokenAddress, chainId],
  );

  const initializeDeBridge = useCallback(() => {
    if (window.deBridge) {
      window.deBridge.widget(debridgeConfig);
    }
  }, [debridgeConfig]);

  return (
    <>
      <Script
        src={DEBRIDGE_WIDGET_URL}
        strategy="lazyOnload"
        onReady={initializeDeBridge}
      />

      <div id="debridgeWidget" style={{ width: "100%" }} />
    </>
  );
};
