import type { TransactionRequest } from "@gnosispay/account-kit";

const deserializeTransaction = (transactionData: string) => {
  const txData = JSON.parse(transactionData) as TransactionRequest;
  txData.value = txData.value ? BigInt(txData.value) : BigInt(0);
  return txData;
};

export default deserializeTransaction;
