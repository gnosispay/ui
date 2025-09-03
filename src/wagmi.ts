import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { gnosis } from "wagmi/chains";
import { safe } from "wagmi/connectors";
import { injectedWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Gnosis Pay",
    // it's fine to have the id here, it has an allow list for the domains we use
    projectId: "02e652f4cb3974c4c3a822aa56ec09f6",
  },
);

export const config = createConfig({
  chains: [gnosis],
  connectors: [
    ...connectors,
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
      shimDisconnect: false,
    }),
  ],
  transports: {
    [gnosis.id]: http(),
  },
});
