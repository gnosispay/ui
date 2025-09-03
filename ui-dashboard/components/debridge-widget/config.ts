export const DEBRIDGE_WIDGET_URL =
  "https://app.debridge.finance/assets/scripts/widget.js";

/**
 * Config for deBridge UI widget, fully customizable via:
 *
 * https://app.debridge.finance/widget
 */
export const generateDebridgeConfig = ({
  toAddress,
  tokenAddress,
  chainId,
}: {
  toAddress: string;
  tokenAddress: string;
  chainId: number;
}) => {
  const suportedDebridgeChains = {
    "1": "all",
    "10": "all",
    "56": "all",
    "100": "all",
    "137": "all",
    "1088": "all",
    "7171": "all",
    "8453": "all",
    "42161": "all",
    "43114": "all",
    "59144": "all",
    "7565164": "all",
    "245022934": "all",
  };

  return {
    outputChain: chainId,
    outputCurrency: tokenAddress,
    address: toAddress,
    v: "1",
    element: "debridgeWidget",
    title: "Swap tokens with deBridge",
    description: "",
    width: "100%",
    height: "750",
    r: "30907",
    supportedChains: JSON.stringify({
      inputChains: suportedDebridgeChains,
      outputChains: suportedDebridgeChains,
    }),
    showSwapTransfer: true,
    isAmountFromNotModifiable: false,
    isAmountToNotModifiable: false,
    lang: "en",
    mode: "deswap",
    isEnableCalldata: false,
    styles: btoa(
      JSON.stringify({ primaryBtnBg: "#211c20", primaryBtnBgHover: "#211c20" }),
    ),
    theme: "light",
    isHideLogo: false,
  };
};
