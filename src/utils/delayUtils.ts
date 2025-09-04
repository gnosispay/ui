import { currencies, supportedTokens, type TokenInfo } from "@/constants";
import { decodeErc20Transfer } from "@/lib/fetchErc20Transfers";
import { DelayedTransactionType, profileDelayedTransaction, type TransactionRequest } from "@gnosispay/account-kit";
import { shortenAddress } from "./shortenAddress";

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
    console.log("Error profiling transaction", error);
    txType = DelayedTransactionType.Other;
  }

  let token: TokenInfo | undefined;
  let receiver: `0x${string}` | null;

  if (txType === DelayedTransactionType.NativeTransfer) {
    token = supportedTokens.XDAI;
    receiver = transactionData.to as `0x${string}`;
  } else {
    token = Object.values(currencies).find((token) => token.address === transactionData.to);
    if (!token) {
      token = Object.values(supportedTokens).find((token) => token.address === transactionData.to);
    }

    try {
      receiver = decodeErc20Transfer(transactionData.data as `0x${string}`).args?.[0] as `0x${string}`;
    } catch (error) {
      console.error("Error decoding erc20 transfer", error);
      receiver = null;
    }
  }

  return { txType, token, receiver };
};

export const getTxTitle = (account: string, transactionData: TransactionRequest) => {
  const { txType, token, receiver } = getTxInfo(account, transactionData);

  console.log("txType", txType);
  console.log("token", token);
  console.log("receiver", receiver);

  switch (txType) {
    case DelayedTransactionType.ERC20Transfer:
    case DelayedTransactionType.NativeTransfer:
      return `Sending ${token?.symbol} to ${shortenAddress(receiver ?? "")}`;
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
