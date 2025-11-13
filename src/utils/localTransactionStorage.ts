/**
 * Local storage utility for storing transaction details when enqueueing
 * This allows us to execute transactions later without needing the API
 */

export interface StoredTransaction {
  to: string;
  value: string;
  data: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  amount?: string;
  recipient?: string;
  timestamp: number;
  txHash?: string;
}

const STORAGE_KEY = "gnosispay_pending_transactions";

/**
 * Get all stored transactions for a safe address
 */
export function getStoredTransactions(safeAddress: string): StoredTransaction[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${safeAddress.toLowerCase()}`);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading stored transactions:", error);
    return [];
  }
}

/**
 * Store a transaction for later execution
 */
export function storeTransaction(safeAddress: string, transaction: StoredTransaction): void {
  try {
    const transactions = getStoredTransactions(safeAddress);
    transactions.push(transaction);
    localStorage.setItem(
      `${STORAGE_KEY}_${safeAddress.toLowerCase()}`,
      JSON.stringify(transactions)
    );
  } catch (error) {
    console.error("Error storing transaction:", error);
  }
}

/**
 * Remove a transaction after it's been executed
 */
export function removeTransaction(safeAddress: string, timestamp: number): void {
  try {
    const transactions = getStoredTransactions(safeAddress);
    const filtered = transactions.filter((tx) => tx.timestamp !== timestamp);
    localStorage.setItem(
      `${STORAGE_KEY}_${safeAddress.toLowerCase()}`,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error("Error removing transaction:", error);
  }
}

/**
 * Clear all stored transactions for a safe address
 */
export function clearStoredTransactions(safeAddress: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${safeAddress.toLowerCase()}`);
  } catch (error) {
    console.error("Error clearing stored transactions:", error);
  }
}

/**
 * Get the oldest pending transaction (FIFO)
 */
export function getNextTransaction(safeAddress: string): StoredTransaction | null {
  const transactions = getStoredTransactions(safeAddress);
  return transactions.length > 0 ? transactions[0] : null;
}

