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
      projectId: "97f66822692378042f2b9a3c6d370c2b",
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
