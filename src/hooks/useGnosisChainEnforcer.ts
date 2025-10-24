import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { gnosis } from "wagmi/chains";

/**
 * Hook to ensure the wallet is always connected to Gnosis chain
 * Automatically switches to Gnosis chain if connected to a different network
 */
export const useGnosisChainEnforcer = () => {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Only enforce if wallet is connected and on wrong chain
    if (isConnected && chainId && chainId !== gnosis.id) {
      try {
        switchChain({ chainId: gnosis.id });
      } catch (error) {
        console.error("Failed to switch to Gnosis chain:", error);
      }
    }
  }, [isConnected, chainId, switchChain]);

  return {
    isOnGnosisChain: chainId === gnosis.id,
    gnosisChainId: gnosis.id,
  };
};
