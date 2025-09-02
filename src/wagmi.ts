import { http, createConfig } from "wagmi";
import { gnosis } from "wagmi/chains";
import { injected, safe, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [gnosis],
  connectors: [
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
      shimDisconnect: false,
    }),
    injected(),
    walletConnect({
      projectId: "02e652f4cb3974c4c3a822aa56ec09f6",
    }),
  ],
  transports: {
    [gnosis.id]: http(),
  },
});

// declare module "wagmi" {
//   interface Register {
//     config: typeof config;
//   }
// }
