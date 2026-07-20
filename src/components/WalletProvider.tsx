import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { gnosis } from "wagmi/chains";
import { useTheme } from "@/context/ThemeContext";

/**
 * Wraps RainbowKit's provider and keeps its theme in sync with the app's
 * theme context. Must be rendered inside WagmiProvider and QueryClientProvider.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const { effectiveTheme } = useTheme();

  const theme = useMemo(() => (effectiveTheme === "dark" ? darkTheme() : lightTheme()), [effectiveTheme]);

  return (
    <RainbowKitProvider theme={theme} initialChain={gnosis} modalSize="compact">
      {children}
    </RainbowKitProvider>
  );
}
