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

createAppKit({
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
  },
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
