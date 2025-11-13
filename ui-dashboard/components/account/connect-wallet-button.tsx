"use client";

import { useModal } from "connectkit";
import { useAccount } from "wagmi";
import { Wallet } from "@phosphor-icons/react";
import Button from "../buttons/buttonv2";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

const ConnectWalletButton: React.FC<Props> = ({
  className,
  children = "Connect wallet",
}) => {
  const { isConnected } = useAccount();

  // Close the connectkit modal once an address has been connected
  const onConnect = async () => {
    setOpen(false);
  };
  const { openProfile, setOpen } = useModal({ onConnect });

  return (
    <Button
      type="button"
      className={className}
      disabled={isConnected}
      onClick={() => openProfile()}
    >
      <Wallet />
      {!isConnected && children}
      {isConnected && <>Connected</>}
    </Button>
  );
};

export default ConnectWalletButton;
