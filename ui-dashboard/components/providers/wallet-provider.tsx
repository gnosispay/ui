"use client";

import { createConfig, WagmiProvider, http } from "wagmi";
import { gnosis, mainnet } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

import SiweAuthProvider from "@/app/(auth)/auth-provider";
import AccountAvatar from "../account/account-avatar";
import type { Chain } from "wagmi/chains";

const chains: readonly [Chain, ...Chain[]] = [gnosis, mainnet];
export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? "",

    // Required
    appName: "Gnosis Pay",

    // Chains
    chains,
    appIcon: "https://old.gnosispay.com/icon.png",

    // Custom RPC transports using private gateway
    transports: {
      [gnosis.id]: http("/api/v1/rpc/gnosis"),
      [mainnet.id]: http("/api/v1/rpc/mainnet"),
    },
  }),
);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
);

export const ConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <WalletProvider>
    <SiweAuthProvider>
      <ConnectKitProvider
        options={{ customAvatar: AccountAvatar, enforceSupportedChains: false }}
      >
        {children}
      </ConnectKitProvider>
    </SiweAuthProvider>
  </WalletProvider>
);
