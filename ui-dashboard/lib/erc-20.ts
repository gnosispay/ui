import {
  decodeFunctionData,
  encodeFunctionData,
  parseAbiItem,
  createPublicClient,
  http,
  fallback,
} from "viem";
import { gnosis } from "viem/chains";
import { getAddress } from "ethers";
import { z } from "zod";
import {
  Erc20TokenEventDirection,
  type Erc20TokenEvent,
} from "@gnosispay/types";
import { fromUnixTime } from "date-fns";

const ERC20Abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const encodeErc20Transfer = (recipient: string, amount: bigint) => {
  return encodeFunctionData({
    abi: ERC20Abi,
    functionName: "transfer",
    args: [recipient, amount],
  });
};

export const decodeErc20Transfer = (data: `0x${string}`) => {
  return decodeFunctionData({
    abi: ERC20Abi,
    data,
  });
};

export const fetchErc20Transfers = async ({
  safeAddress,
  tokenAddress,
}: {
  safeAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
}): Promise<Erc20TokenEvent[]> => {
  try {
    const hexAddressSchema = z
      .string()
      .refine((value): value is `0x${string}` => value.startsWith("0x"));
    const eventSchema = z.object({
      args: z.object({
        from: hexAddressSchema,
        to: hexAddressSchema,
        value: z.bigint(),
      }),
      transactionHash: hexAddressSchema,
      blockNumber: z.bigint(),
    });

    const provider = createPublicClient({
      chain: gnosis,
      transport: http("/api/v1/rpc/gnosis"),
    });

    const eventFilters = [{ from: safeAddress }, { to: safeAddress }];
    const transferEvent = parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    );

    const [outgoingEvents = [], incomingEvents = []] = await Promise.all(
      eventFilters.map(
        async (args) =>
          await provider.getLogs({
            address: tokenAddress,
            event: transferEvent,
            args,
            fromBlock: 0n,
            toBlock: "latest",
          }),
      ),
    );

    const events = [...outgoingEvents, ...incomingEvents].sort(
      (event1, event2) =>
        Number(event2.blockNumber) - Number(event1.blockNumber),
    );

    return await Promise.all(
      events.map(async (event) => {
        const {
          args: { from, to, value },
          transactionHash,
          blockNumber,
        } = eventSchema.parse(event);

        const block = await provider.getBlock({
          blockNumber,
        });

        if (!block || !block.timestamp) {
          throw new Error(`Failed to get block data for block ${blockNumber}`);
        }

        return {
          direction:
            getAddress(from) === getAddress(safeAddress)
              ? Erc20TokenEventDirection.Outgoing
              : Erc20TokenEventDirection.Incoming,
          date: fromUnixTime(Number(block.timestamp)),
          hash: transactionHash,
          from,
          to,
          value,
        };
      }),
    );
  } catch (error) {
    // TODO: show toast
    console.log("Error fetching ERC-20 transactions:", error);
    return [];
  }
};
