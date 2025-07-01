import {
  decodeFunctionData,
  encodeFunctionData,
  parseAbiItem,
  createPublicClient,
  http,
  getAddress,
  parseEventLogs,
} from "viem";
import { gnosis } from "viem/chains";
import { fromUnixTime } from "date-fns";
import { GNOSIS_PAY_SETTLEMENT_ADDRESS } from "@/constants";
import { Erc20TokenEventDirection } from "@/types/transaction";
import type { Erc20TokenEvent } from "@/types/transaction";

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
  address,
  tokenAddress,
  fromDate,
  skipSettlementTransfers,
}: {
  address: `0x${string}`;
  tokenAddress: `0x${string}`;
  fromDate?: string;
  skipSettlementTransfers: boolean;
}): Promise<{ data?: Erc20TokenEvent[]; error?: Error | null }> => {
  try {
    const provider = createPublicClient({
      chain: gnosis,
      transport: http(),
    });

    const eventFilters = [{ from: address }, { to: address }];
    const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

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
      (event1, event2) => Number(event2.blockNumber) - Number(event1.blockNumber),
    );

    const transfers = await Promise.all(
      events.map(async (event) => {
        const parsedLogs = parseEventLogs({
          abi: [transferEvent],
          logs: [event],
        });

        if (parsedLogs.length === 0) {
          return null;
        }

        const parsedLog = parsedLogs[0];
        const { from, to, value } = parsedLog.args;
        const { transactionHash, blockNumber } = event;

        if (!from || !to || value === undefined || !blockNumber || !transactionHash) {
          return null;
        }

        if (to === GNOSIS_PAY_SETTLEMENT_ADDRESS && skipSettlementTransfers) {
          return null;
        }

        const block = await provider.getBlock({
          blockNumber,
        });

        if (!block || !block.timestamp) {
          return null;
        }

        const eventDate = fromUnixTime(Number(block.timestamp));

        // Apply date filter if provided
        if (fromDate && eventDate < new Date(fromDate)) {
          return null;
        }

        return {
          direction:
            getAddress(from) === getAddress(address)
              ? Erc20TokenEventDirection.Outgoing
              : Erc20TokenEventDirection.Incoming,
          date: eventDate,
          hash: transactionHash,
          from,
          to,
          value,
        };
      }),
    );

    const filteredTransfers = transfers.filter((transfer): transfer is Erc20TokenEvent => transfer !== null);
    return { data: filteredTransfers };
  } catch (error) {
    console.error("Error fetching ERC-20 transactions:", error);
    return {
      error: error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
};
