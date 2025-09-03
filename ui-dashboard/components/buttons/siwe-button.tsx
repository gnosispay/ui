"use client";
import { Wallet } from "@phosphor-icons/react";
import { useIsMounted, useModal, useSIWE } from "connectkit";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useAccount } from "wagmi";
import { useActivePartner } from "@/hooks/use-active-partner";
import { triggerEvent as triggerGTMEvent, GTM_EVENTS } from "../../lib/gtm";
import Button from "./button";
import type { SIWESession } from "connectkit";

const SiweButton = ({
  className,
  /** @deprecated The onSignIn seems not to be fired on the useSIWE callback, use with care. */
  onSignIn,
  isSubmitting,
  disabled,
  onConnectInit,
  connectWalletText,
}: {
  className?: string;
  onSignIn?: (data?: SIWESession | undefined) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  onConnectInit?: () => void;
  connectWalletText?: string;
}) => {
  const { openSIWE } = useModal();
  const { isConnected } = useAccount();
  const activePartner = useActivePartner();

  const { refresh } = useRouter();
  const { isLoading: isAuthLoading, signIn } = useSIWE({
    onSignIn: async (data) => {
      onSignIn?.(data);

      triggerGTMEvent(GTM_EVENTS.ACTIONS.USER_SIGNED_IN);
      refresh();
    },
  });

  const handleConnect = () => {
    onConnectInit?.();
    return openSIWE();
  };

  const loading = isAuthLoading || isSubmitting;
  const isMounted = useIsMounted();

  const displayConnectWalletText =
    connectWalletText ??
    (activePartner ? `Connect ${activePartner.name} Wallet` : "Connect wallet");

  if (!isMounted)
    {return (
      <Button loading className={twMerge(className)} disabled={disabled}>
        Loading
      </Button>
    );}

  if (isConnected) {
    return (
      <Button
        type="button"
        onClick={signIn}
        className={className}
        loading={loading}
        disabled={disabled}
      >
        <Wallet />

        {displayConnectWalletText}
      </Button>
    );
  }

  /** A wallet needs to be connected first */
  return (
    <Button
      type="button"
      onClick={handleConnect}
      className={className}
      loading={loading}
      disabled={disabled}
    >
      <Wallet />

      {displayConnectWalletText}
    </Button>
  );
};

export default SiweButton;
