import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { gnosis } from "wagmi/chains";

const projectId = "02e652f4cb3974c4c3a822aa56ec09f6";

// Allow RPC URL to be configured via environment variable (useful for testing with Anvil)
export const gnosisRpcUrl = import.meta.env.VITE_GNOSIS_RPC_URL || undefined;

// Plain wagmi config built via RainbowKit's helper. All JSON-RPC traffic
// (balances, contract reads, tx broadcast) flows through our own transport
// below, never through a third-party wallet provider's RPC.
export const wagmiConfig = getDefaultConfig({
  appName: "Gnosis Pay",
  appDescription: "Decentralization. Accepted Everywhere.",
  // Must match the origin the app is served from and the SIWE `domain`
  // (app.gnosispay.com). A mismatch makes WalletConnect/MetaMask flag the
  // sign-in as suspicious ("the site making the request is not the site
  // you're signing into").
  appUrl: "https://app.gnosispay.com",
  appIcon: "https://app.gnosispay.com/favicon.ico",
  projectId,
  chains: [gnosis],
  transports: {
    [gnosis.id]: http(gnosisRpcUrl),
  },
  ssr: false,
});
