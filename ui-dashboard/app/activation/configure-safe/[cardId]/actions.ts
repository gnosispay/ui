import { createPublicClient, http, parseAbi } from "viem";
import { gnosis } from "viem/chains";
import { SENTINEL_ADDRESS } from "../../../../lib/constants";
import type { Address } from "viem";

export async function validateSafeConfiguration(safe: Address) {
  const abi = parseAbi([
    "function getOwners() view returns (address[])",
    "function getModulesPaginated(address,uint256) view returns (address[], address)",
  ]);

  const client = createPublicClient({
    chain: gnosis,
    transport: http("/api/v1/rpc/gnosis"),
  });

  const owners = await client.readContract({
    address: safe,
    abi,
    functionName: "getOwners",
  });

  const [modules] = await client.readContract({
    address: safe,
    abi,
    functionName: "getModulesPaginated",
    args: [SENTINEL_ADDRESS, BigInt(10)],
  });

  const hasZeroModules = modules.length == 0;
  const hasASingleOwner = owners.length == 1;
  const isValidInferred = hasASingleOwner && hasZeroModules;
  const safeOwner = owners[0];

  return {
    hasZeroModules,
    hasASingleOwner,
    isValidInferred,
    safeOwner,
  };
}
