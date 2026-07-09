import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { http } from "wagmi";
import { gnosis } from "wagmi/chains";
import { safe, injected } from "wagmi/connectors";

const projectId = "02e652f4cb3974c4c3a822aa56ec09f6";

// Allow RPC URL to be configured via environment variable (useful for testing with Anvil)
export const gnosisRpcUrl = import.meta.env.VITE_GNOSIS_RPC_URL || undefined;

const gnosisCaipId = `eip155:${gnosis.id}` as const;

// WalletConnect session methods derived from actual app usage:
// - personal_sign / eth_signTypedData*: SIWE auth and Safe signatures
// - eth_sendTransaction: withdrawals and delay-module execution
// - eth_call / eth_getBalance / eth_getCode: balances, contract reads, smart-wallet checks
// - eth_getTransactionReceipt / eth_getTransactionCount / eth_estimateGas / eth_gasPrice: tx lifecycle
// - wallet_switchEthereumChain: Gnosis chain enforcement
const eip155Methods = [
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
  "eth_call",
  "eth_getBalance",
  "eth_getCode",
  "eth_getTransactionReceipt",
  "eth_getTransactionCount",
  "eth_estimateGas",
  "eth_blockNumber",
  "eth_gasPrice",
  "wallet_switchEthereumChain",
] as const;

const universalProviderConfigOverride = {
  methods: { eip155: [...eip155Methods] },
  chains: { eip155: [String(gnosis.id)] },
  events: { eip155: ["accountsChanged", "chainChanged"] },
  defaultChain: gnosisCaipId,
};

const customRpcUrls = gnosisRpcUrl ? { [gnosisCaipId]: [{ url: gnosisRpcUrl }] } : undefined;

export const wagmiAdapter = new WagmiAdapter({
  networks: [gnosis],
  projectId,
  connectors: [
    injected(),
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
      shimDisconnect: false,
    }),
  ],
  transports: {
    [gnosis.id]: http(gnosisRpcUrl),
  },
  customRpcUrls,
  ssr: false,
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
  // themeVariables: {
  //   "--apkt-font-family": '"DM Sans", system-ui, Avenir, Helvetica, Arial, sans-serif',
  //   "--apkt-accent": "var(--color-brand)",
  //   "--apkt-color-mix": "var(--color-brand)",
  //   "--apkt-color-mix-strength": 20,
  //   "--apkt-font-size-master": "16px",
  //   "--apkt-border-radius-master": "var(--radius)",
  //   "--apkt-z-index": 1000,
  // },
  // Force Gnosis chain for WalletConnect
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: false,
  // Ensure only Gnosis chain is available
  allowUnsupportedChain: false,
  // Avoid automatic reconnect RPC traffic on page load
  enableReconnect: false,
  universalProviderConfigOverride,
  customRpcUrls,
});
