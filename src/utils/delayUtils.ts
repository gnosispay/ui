import { currencies, supportedTokens, type TokenInfo, type CurrencyInfo } from "@/constants";
import { decodeErc20Transfer } from "@/utils/fetchErc20Transfers";
import { DelayedTransactionType, profileDelayedTransaction, type TransactionRequest } from "@gnosispay/account-kit";
import { shortenAddress } from "./shortenAddress";
import { formatCurrency } from "./formatCurrency";
import type { Address } from "viem";
import { decodeFunctionData } from "viem";
import { DELAY_MOD_ABI } from "./abis/delayAbi";
import { DAILY_LIMIT_ABI } from "./abis/dailyLimitAbi";

const decodeDelayTransaction = (data: Address) => {
  try {
    return decodeFunctionData({
      abi: DELAY_MOD_ABI,
      data,
    });
  } catch (error) {
    console.info("Error decoding Delay transaction", error);
    return null;
  }
};

const decodeDailyLimitTransaction = (data: Address) => {
  try {
    return decodeFunctionData({
      abi: DAILY_LIMIT_ABI,
      data,
    });
  } catch (error) {
    console.info("Error decoding daily limit transaction", error);
    return null;
  }
};

export const deserializeTransaction = (transactionData: string) => {
  const txData = JSON.parse(transactionData) as TransactionRequest;
  txData.value = txData.value ? BigInt(txData.value) : BigInt(0);
  return txData;
};

export const getTxInfo = (account: string, transactionData: TransactionRequest) => {
  let txType: DelayedTransactionType;
  console.log("transactionData", transactionData);
  try {
    txType = profileDelayedTransaction(account, transactionData);
  } catch (error) {
    console.info("Error profiling transaction", error);
    txType = DelayedTransactionType.Other;
  }

  let token: TokenInfo | undefined;
  let receiver: Address | undefined;
  let ownerAddress: Address | undefined;
  let dailyLimit: bigint | undefined;

  if (txType === DelayedTransactionType.NativeTransfer) {
    token = supportedTokens.XDAI;
    receiver = transactionData.to as Address;
  } else if (txType === DelayedTransactionType.ERC20Transfer) {
    token = Object.values(currencies).find((token) => token.address === transactionData.to);
    if (!token) {
      token = Object.values(supportedTokens).find((token) => token.address === transactionData.to);
    }

    try {
      receiver = decodeErc20Transfer(transactionData.data as Address).args?.[0] as Address;
    } catch (error) {
      console.info("Error decoding erc20 transfer", error);
      receiver = undefined;
    }
  } else if (txType === DelayedTransactionType.AddOwner || txType === DelayedTransactionType.RemoveOwner) {
    // Try decoding as Delay module owner operations
    const decodedDelay = decodeDelayTransaction(transactionData.data as Address);
    if (decodedDelay?.args) {
      if (decodedDelay.functionName === "enableModule") {
        ownerAddress = decodedDelay.args[0] as Address;
      } else if (decodedDelay.functionName === "disableModule") {
        ownerAddress = decodedDelay.args[1] as Address;
      }
    }
  } else if (txType === DelayedTransactionType.LimitChange) {
    // Decode daily limit change operations
    const decodedLimit = decodeDailyLimitTransaction(transactionData.data as Address);
    if (decodedLimit?.args) {
      if (decodedLimit.functionName === "setAllowance") {
        // For setAllowance, the amount is the second parameter (uint128)
        dailyLimit = BigInt(decodedLimit.args[1] as number);
      }
    }
  }

  return { txType, token, receiver, ownerAddress, dailyLimit };
};

interface TxTitleParams {
  account?: string | null;
  transactionDataString?: string | null;
  currencyInfo?: CurrencyInfo | null;
}

export const getTxTitle = ({ account, transactionDataString, currencyInfo }: TxTitleParams) => {
  if (!transactionDataString || !account) {
    return "Transaction";
  }

  const transactionData = deserializeTransaction(transactionDataString);
  const { txType, token, receiver, ownerAddress, dailyLimit } = getTxInfo(account, transactionData);
  console.log("txType", txType);
  console.log("token", token);
  console.log("receiver", receiver);
  console.log("ownerAddress", ownerAddress);
  console.log("dailyLimit", dailyLimit);

  switch (txType) {
    case DelayedTransactionType.ERC20Transfer:
    case DelayedTransactionType.NativeTransfer:
      if (receiver && token?.tokenSymbol) {
        return `Sending ${token?.tokenSymbol} to ${shortenAddress(receiver ?? "")}`;
      }
      return "Sending Transaction";
    case DelayedTransactionType.AddOwner:
      if (ownerAddress) {
        return `Adding Account Owner: ${shortenAddress(ownerAddress)}`;
      }
      return "Adding Account Owner";
    case DelayedTransactionType.RemoveOwner:
      if (ownerAddress) {
        return `Removing Account Owner: ${shortenAddress(ownerAddress)}`;
      }
      return "Removing Account Owner";
    case DelayedTransactionType.LimitChange:
      if (dailyLimit !== undefined) {
        // Format as currency using the safe's configured currency
        const formattedAmount = formatCurrency(dailyLimit.toString(), currencyInfo ?? undefined);
        if (formattedAmount) {
          return `Changing Daily Limit: ${formattedAmount}`;
        }
      }
      return "Changing Daily Limit";
    case DelayedTransactionType.SignMessage:
      return "Generating IBAN";
    default:
      return "Contract interaction";
  }
};
