import { currencies, supportedTokens, type TokenInfo } from "@/constants";
import { decodeErc20Transfer } from "@/lib/fetchErc20Transfers";
import { DelayedTransactionType, profileDelayedTransaction, type TransactionRequest } from "@gnosispay/account-kit";
import { shortenAddress } from "./shortenAddress";
import { Address } from "viem";

export const deserializeTransaction = (transactionData: string) => {
  const txData = JSON.parse(transactionData) as TransactionRequest;
  txData.value = txData.value ? BigInt(txData.value) : BigInt(0);
  return txData;
};

export const getTxInfo = (account: string, transactionData: TransactionRequest) => {
  let txType: DelayedTransactionType;
  try {
    txType = profileDelayedTransaction(account, transactionData);
  } catch (error) {
    console.info("Error profiling transaction", error);
    txType = DelayedTransactionType.Other;
  }

  let token: TokenInfo | undefined;
  let receiver: Address | null;

  if (txType === DelayedTransactionType.NativeTransfer) {
    token = supportedTokens.XDAI;
    receiver = transactionData.to as Address;
  } else {
    token = Object.values(currencies).find((token) => token.address === transactionData.to);
    if (!token) {
      token = Object.values(supportedTokens).find((token) => token.address === transactionData.to);
    }

    try {
      receiver = decodeErc20Transfer(transactionData.data as Address).args?.[0] as Address;
    } catch (error) {
      console.info("Error decoding erc20 transfer", error);
      receiver = null;
    }
  }

  return { txType, token, receiver };
};

export const getTxTitle = (account?: string | null, transactionDataString?: string | null) => {
  if (!transactionDataString || !account) {
    return "Transaction";
  }

  const transactionData = deserializeTransaction(transactionDataString);
  const { txType, token, receiver } = getTxInfo(account, transactionData);

  if (
    (txType === DelayedTransactionType.ERC20Transfer || txType === DelayedTransactionType.NativeTransfer) &&
    (!receiver || !token?.tokenSymbol)
  ) {
    return `Transaction`;
  }

  switch (txType) {
    case DelayedTransactionType.ERC20Transfer:
    case DelayedTransactionType.NativeTransfer:
      return `Sending ${token?.tokenSymbol} to ${shortenAddress(receiver ?? "")}`;
    case DelayedTransactionType.AddOwner:
      return "Adding Account Owner";
    case DelayedTransactionType.RemoveOwner:
      return "Removing Account Owner";
    case DelayedTransactionType.LimitChange:
      return "Spending limit change";
    case DelayedTransactionType.SignMessage:
      return "Generating IBAN";
    default:
      return "Contract interaction";
  }
};
