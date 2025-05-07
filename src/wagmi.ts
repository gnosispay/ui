import { http, createConfig } from "wagmi";
import { gnosis, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, safe } from "wagmi/connectors";

export const config = createConfig({
  chains: [gnosis, sepolia],
  connectors: [
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
      shimDisconnect: false,
    }),
    injected(),
    coinbaseWallet(),
  ],
  transports: {
    [sepolia.id]: http(),
    [gnosis.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
