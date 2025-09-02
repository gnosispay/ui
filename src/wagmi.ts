import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { gnosis } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Gnosis Pay",
  appDescription: "Gnosis Pay - Your gateway to DeFi payments",
  appUrl: "https://v2.gnosispay.com",
  appIcon: "https://framerusercontent.com/images/gF4AHnqudSqMqpTf5kFE93eQuHs.png",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "2f5a2b1c8e9d4f3a6b7c8d9e0f1a2b3c", // Get your own from https://cloud.reown.com/
  chains: [gnosis],
  // connectors: [
  //   safe({
  //     allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
  //     debug: false,
  //     shimDisconnect: false,
  //   }),
  //   injected(),
  //   coinbaseWallet(),
  // ],
  transports: {
    [gnosis.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
