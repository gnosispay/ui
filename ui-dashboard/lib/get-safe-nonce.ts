import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import type { Address } from "viem";

const getSafeNonce = async (address: Address, chainId: number) => {
  const abi = [
    {
      inputs: [],
      name: "nonce",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];
  const nonce = await readContract(wagmiConfig, {
    address,
    abi,
    chainId,
    functionName: "nonce",
  });
  return nonce as number;
};

export default getSafeNonce;
