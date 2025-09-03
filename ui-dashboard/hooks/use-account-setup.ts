"use client";

import { useState } from "react";

import { populateAccountSetup } from "@gnosispay/account-kit";
import {
  type Address,
  BaseError,
  isAddress,
  UserRejectedRequestError,
} from "viem";
import { readContract } from "wagmi/actions";
import { switchChain } from "@wagmi/core";

import { useAccount } from "wagmi";
import { captureException } from "@sentry/nextjs";
import { TOKEN_BY_ADDRESS } from "@gnosispay/tokens";
import api from "@/lib/api";
import {
  DEFAULT_ALLOWANCE_PERIOD,
  DELAY_COOLDOWN,
  DELAY_EXPIRATION,
} from "@/lib/constants";
import { poll } from "@/lib/poll";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import useSign from "./use-sign";
import type { TransactionRequest } from "@gnosispay/account-kit";

const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;
const SPENDER_ADDRESS = process.env.NEXT_PUBLIC_SPENDER_ADDRESS;
const ALLOWANCE_REFILL_NO_DECIMALS = 350;

const SAFE_ABI = [
  {
    inputs: [],
    name: "nonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const isUserRejectionError = (error: unknown) =>
  error instanceof BaseError &&
  error.walk((e) => e instanceof UserRejectedRequestError) instanceof
    UserRejectedRequestError;

const relay = async (transaction: TransactionRequest) => {
  const response = await api().post("/relay", {
    target: transaction.to,
    chainId: 100,
    data: transaction.data,
  });
  const { taskId } = await response.json();

  const task = await poll({
    fn: async () => {
      const url = `https://api.gelato.digital/tasks/status/${taskId}`;
      const response = await fetch(url);
      const result = await response.json();
      return result;
    },
    validate: (result) => {
      const status = result?.task?.taskState;
      return (
        status === "Cancelled" ||
        status === "ExecReverted" ||
        status === "ExecSuccess"
      );
    },
    interval: 1_000,
    maxAttempts: 240,
  });

  if (task?.task.taskState !== "ExecSuccess") {
    const error = new Error(
      task?.lastCheckMessage ?? "On chain execution failed.",
    );
    captureException(error, {
      tags: { taskId },
    });
    throw error;
  }

  return task;
};

const useAccountSetup = (account?: string, tokenAddress?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address } = useAccount();
  const sign = useSign();

  const setupAccount = async () => {
    if (!account) {
      throw new Error("No account address");
    }
    if (!address) {
      throw new Error("No owner address");
    }
    if (!tokenAddress) {
      throw new Error("No token address");
    }
    if (!isAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }

    if (!SPENDER_ADDRESS) {
      throw new Error("No spender address");
    }
    if (!RECEIVER_ADDRESS) {
      throw new Error("No receiver address");
    }

    const token = TOKEN_BY_ADDRESS[tokenAddress];
    if (!token) {
      throw new Error("Missing token configuration");
    }

    setIsLoading(true);

    const config = {
      // The address that will recieve the spent funds
      receiver: RECEIVER_ADDRESS,
      // The address that will transfer the spent funds
      spender: SPENDER_ADDRESS,
      // The token that is allowed to be spent
      token: tokenAddress,
      allowance: {
        refill: token.amount(ALLOWANCE_REFILL_NO_DECIMALS),
        period: DEFAULT_ALLOWANCE_PERIOD,
      },
      delay: {
        cooldown: DELAY_COOLDOWN,
        expiration: DELAY_EXPIRATION,
      },
    };

    try {
      // Get safe nonce
      const nonce = await readContract(wagmiConfig, {
        abi: SAFE_ABI,
        address: account as Address,
        functionName: "nonce",
        chainId: 100,
      });

      // Switch chain and ask for signature
      setIsWaitingForUser(true);
      if (chain?.id !== 100) {
        await switchChain(wagmiConfig, { chainId: 100 });
      }
      const transaction = await populateAccountSetup(
        {
          account,
          owner: address,
          chainId: 100,
          nonce: Number(nonce),
        },
        config,
        sign,
      );
      setIsWaitingForUser(false);

      // Relay transaction
      setIsExecuting(true);
      const task = await relay(transaction);
      setIsExecuting(false);

      // Return successfully relayed transaction
      setIsSuccess(true);
      return task;
    } catch (error) {
      setIsSuccess(false);

      // Set error message, except if it's a `UserRejectedRequestError`
      if (!isUserRejectionError(error)) {
        setError(error?.toString() ?? null);
      }
    } finally {
      setIsWaitingForUser(false);
      setIsExecuting(false);
      setIsLoading(false);
    }
  };

  return {
    setupAccount,
    isLoading: isLoading,
    isWaitingForUser: isWaitingForUser,
    isExecuting: isExecuting,
    isSuccess: isSuccess,
    error,
  };
};

export default useAccountSetup;
