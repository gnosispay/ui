import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { gnosis } from "wagmi/chains";
import { safeWallet } from "./wallets/safeWallet";

const projectId = "02e652f4cb3974c4c3a822aa56ec09f6";

// Allow RPC URL to be configured via environment variable (useful for testing with Anvil)
export const gnosisRpcUrl = import.meta.env.VITE_GNOSIS_RPC_URL || undefined;

// Plain wagmi config built via RainbowKit's helper. All JSON-RPC traffic
// (balances, contract reads, tx broadcast) flows through our own transport
// below, never through a third-party wallet provider's RPC.
export const wagmiConfig = getDefaultConfig({
  appName: "Gnosis Pay",
  appDescription: "Decentralization. Accepted Everywhere.",
  appUrl: "https://gnosispay.com",
  appIcon: "https://gnosispay.com/favicon.ico",
  projectId,
  chains: [gnosis],
  // Mirror RainbowKit's default wallet lineup, but swap its option-less Safe
  // wallet for our configured one (restores the AppKit-era Safe App config).
  wallets: [
    {
      groupName: "Popular",
      wallets: [injectedWallet, safeWallet, walletConnectWallet],
    },
  ],
  transports: {
    [gnosis.id]: http(gnosisRpcUrl),
  },
  ssr: false,
});
