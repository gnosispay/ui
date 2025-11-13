import { toast } from "react-hot-toast";
import { useAccount, useSwitchChain } from "wagmi";
import ConnectWalletButton from "@/components/account/connect-wallet-button";
import { GNOSIS_CHAIN_ID } from "@/lib/constants";
import Button from "../../../../buttons/buttonv2";

interface IbanCardActionButtonProps {
  requiresConnectedWallet?: boolean;
  buttonText: string;
  onClick: () => void;
  actionDisabled?: boolean;
}
export const IbanCardActionButton = ({
  requiresConnectedWallet,
  onClick,
  actionDisabled,
  buttonText,
}: IbanCardActionButtonProps) => {
  const { isConnected: isWalletConnected, chainId: connectedChainId } =
    useAccount();

  const { switchChain } = useSwitchChain();

  const switchToGnosisChain = () => {
    try {
      switchChain({ chainId: 100 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch to Gnosis Chain");
    }
  };

  if (requiresConnectedWallet) {
    if (!isWalletConnected) {
      return (
        <ConnectWalletButton
          className="rounded-lg text-sm py-2 px-6 mt-4 font-normal"
        />
      );
    }

    if (connectedChainId !== GNOSIS_CHAIN_ID) {
      return (
        <Button
          className="rounded-lg text-sm py-2 px-6 mt-4 font-normal"
          onClick={switchToGnosisChain}
        >
          Switch to Gnosis Chain
        </Button>
      );
    }
  }

  return (
    <Button
      className="rounded-lg text-sm py-2 px-6 mt-4 font-normal"
      onClick={onClick}
      disabled={actionDisabled}
    >
      {buttonText}
    </Button>
  );
};
