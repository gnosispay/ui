import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createConfig, http } from "wagmi";
import { gnosis } from "wagmi/chains";
import { safe, injected, walletConnect } from "wagmi/connectors";

const projectId = "02e652f4cb3974c4c3a822aa56ec09f6";

const wagmiAdapter = new WagmiAdapter({
  networks: [gnosis],
  projectId,
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [gnosis],
  defaultNetwork: gnosis,
  metadata: {
    name: "Gnosis Pay",
    description: "Decentralization. Accepted Everywhere.",
    url: "https://gnosispay.com",
    icons: ["https://gnosispay.com/favicon.ico"],
  },
  features: {
    analytics: false,
    email: false,
    swaps: false,
    onramp: false,
    socials: false,
    send: false,
    receive: false,
  },
  enableNetworkSwitch: false,
  themeMode: "light",
  themeVariables: {
    "--apkt-font-family": '"DM Sans", system-ui, Avenir, Helvetica, Arial, sans-serif',
    "--apkt-accent": "var(--color-brand)",
    "--apkt-color-mix": "var(--color-brand)",
    "--apkt-color-mix-strength": 20,
    "--apkt-font-size-master": "16px",
    "--apkt-border-radius-master": "var(--radius)", // Uses your design system's border radius
    "--apkt-z-index": 1000,
  } as Record<string, string | number>,
});

export const config = createConfig({
  chains: [gnosis],
  connectors: [
    injected(),
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
      shimDisconnect: false,
    }),
    walletConnect({ projectId }),
  ],
  transports: {
    [gnosis.id]: http(),
  },
});
