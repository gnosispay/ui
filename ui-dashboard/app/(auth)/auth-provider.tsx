
import { SiweMessage } from "siwe";
import { SIWEProvider } from "connectkit";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { getCsrfToken, getSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import type { Address } from "viem";
import type { SIWEConfig } from "connectkit";
import type { ReactNode } from "react";

const SiweAuthProvider = ({ children }: { children: ReactNode }) => {
  const { refresh } = useRouter();

  const siweConfig: SIWEConfig = {
    getNonce: async () => {
      const nonce = await getCsrfToken();
      if (!nonce) {throw new Error();}
      return nonce;
    },
    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        version: "1",
        domain: window.location.host,
        uri: window.location.origin,
        address,
        chainId,
        nonce,
        statement: "Sign in With Ethereum.",
      }).prepareMessage();
    },
    verifyMessage: async ({ message, signature }) => {
      const session = await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl: "/",
      });

      if (session?.ok === true && (session.error === null || session.error === undefined)) {
        return true;
      } else {
        toast.error("Failed to sign in with Wallet");
        return false;
      }
    },
    getSession: async () => {
      const session = await getSession();
      if (!session?.user?.siweAddress) {
        return null;
      }
      const [, chainId, address] = session.user.siweAddress.split(":");
      if (!chainId || !address) {
        return null;
      }
      return {
        address: address as Address,
        chainId: parseInt(chainId, 10),
      };
    },
    signOut: async () => {
      try {
        posthog?.reset();
        await signOut();
      } catch {}
      return true;
    },
    signOutOnAccountChange: false,
    signOutOnNetworkChange: false,
    signOutOnDisconnect: false,
    // Set refetch interval to 2 minutes
    sessionRefetchInterval: 45 * 60 * 1000,
  };
  return (
    <SIWEProvider {...siweConfig} onSignOut={refresh}>
      {children}
    </SIWEProvider>
  );
};

export default SiweAuthProvider;
