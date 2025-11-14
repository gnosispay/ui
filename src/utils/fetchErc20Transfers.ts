import {
  decodeFunctionData,
  encodeFunctionData,
  parseAbiItem,
  createPublicClient,
  http,
  getAddress,
  parseEventLogs,
  type Address,
  type PublicClient,
} from "viem";
import { gnosis } from "viem/chains";
import { fromUnixTime } from "date-fns";
import { GNOSIS_PAY_SETTLEMENT_ADDRESS } from "@/constants";
import { Erc20TokenEventDirection } from "@/types/transaction";
import type { Erc20TokenEvent } from "@/types/transaction";
import { ERC20_ABI } from "./abis/ERC20Abi";

// Gnosis Chain average block time is approximately 5 seconds
const GNOSIS_AVERAGE_BLOCK_TIME = 5;

/**
 * Estimates a block number from a date on Gnosis Chain
 * This is an approximation based on average block times
 */
const estimateBlockFromDate = async (provider: PublicClient, targetDate: Date): Promise<bigint> => {
  try {
    const latestBlock = await provider.getBlock({ blockTag: "latest" });
    const latestTimestamp = Number(latestBlock.timestamp);
    const latestBlockNumber = Number(latestBlock.number);

    const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
    const timeDiff = latestTimestamp - targetTimestamp;

    // If target date is in the future, return latest block
    if (timeDiff <= 0) {
      return latestBlock.number;
    }

    // Estimate blocks back from latest
    const estimatedBlocksBack = Math.floor(timeDiff / GNOSIS_AVERAGE_BLOCK_TIME);
    const estimatedBlockNumber = Math.max(0, latestBlockNumber - estimatedBlocksBack);

    return BigInt(estimatedBlockNumber);
  } catch (error) {
    console.warn("Failed to estimate block from date, falling back to block 0:", error);
    return 0n;
  }
};

export const encodeErc20Transfer = (recipient: Address, amount: bigint) => {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [recipient, amount],
  });
};

export const decodeErc20Transfer = (data: Address) => {
  return decodeFunctionData({
    abi: ERC20_ABI,
    data,
  });
};

export const fetchErc20Transfers = async ({
  address,
  tokenAddresses,
  fromDate,
  toDate,
  skipSettlementTransfers,
}: {
  address: Address;
  tokenAddresses?: Address | Address[];
  fromDate?: string;
  toDate?: string;
  skipSettlementTransfers: boolean;
}): Promise<{ data?: Erc20TokenEvent[]; error?: Error | null; reachedGenesisBlock?: boolean }> => {
  try {
    const provider = createPublicClient({
      chain: gnosis,
      transport: http(),
    });

    // Determine which token addresses to fetch
    const addressesToFetch = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];

    if (addressesToFetch.length === 0) {
      throw new Error("Either tokenAddress or tokenAddresses must be provided");
    }

    // Calculate block range from date parameters
    let fromBlock = 0n;
    let toBlock: bigint | "latest" = "latest";

    if (fromDate) {
      fromBlock = await estimateBlockFromDate(provider, new Date(fromDate));
    }

    if (toDate) {
      toBlock = await estimateBlockFromDate(provider, new Date(toDate));
    }

    const eventFilters = [{ from: address }, { to: address }];
    const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

    // Fetch events for all token addresses
    const allEvents = await Promise.all(
      addressesToFetch.map(async (tokenAddr) => {
        const [outgoingEvents = [], incomingEvents = []] = await Promise.all(
          eventFilters.map(
            async (args) =>
              await provider.getLogs({
                address: tokenAddr,
                event: transferEvent,
                args,
                fromBlock,
                toBlock,
              }),
          ),
        );

        // Add tokenAddress to each event for later identification
        const eventsWithToken = [...outgoingEvents, ...incomingEvents].map((event) => ({
          ...event,
          tokenAddress: tokenAddr,
        }));

        return eventsWithToken;
      }),
    );

    // Flatten and sort all events
    const events = allEvents.flat().sort((event1, event2) => Number(event2.blockNumber) - Number(event1.blockNumber));

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
        const { transactionHash, blockNumber, tokenAddress: eventTokenAddress } = event;

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
          tokenAddress: eventTokenAddress,
        };
      }),
    );

    const filteredTransfers = transfers.filter(
      (transfer): transfer is NonNullable<typeof transfer> => transfer !== null,
    );

    // Check if we've reached the genesis block (block 0)
    const reachedGenesisBlock = fromBlock === 0n;

    return { data: filteredTransfers, reachedGenesisBlock };
  } catch (error) {
    console.error("Error fetching ERC-20 transactions:", error);
    return {
      error: error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
};
