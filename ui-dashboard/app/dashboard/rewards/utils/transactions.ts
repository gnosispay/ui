import { Gift, MoneyWavy } from "@phosphor-icons/react/dist/ssr";
import { SENDER_CASHBACK_ADDRESS, SENDER_REFERRAL_ADDRESS } from "../constants";
import type { Erc20TokenEvent } from "@gnosispay/types";

export const mergeTransactionsByDate = (
  transactionsA: Erc20TokenEvent[],
  transactionsB: Erc20TokenEvent[],
) => {
  return transactionsA.concat(transactionsB).sort((a, b) => +b.date - +a.date);
};

export const byWhitelistedSender =
  (whitelist: string[]) => (transaction: Erc20TokenEvent) => {
    if (whitelist.length === 0) {
      return true;
    }
    return whitelist.includes(transaction.from);
  };

export const getTransactionMeta = (transaction: Erc20TokenEvent) => {
  if (transaction.from === SENDER_CASHBACK_ADDRESS) {
    return {
      Icon: MoneyWavy,
      title: "Cashback",
      currency: "GNO",
    };
  }

  if (transaction.from === SENDER_REFERRAL_ADDRESS) {
    return {
      Icon: Gift,
      title: "Referral bonus",
      currency: "EUR",
    };
  }

  return {
    Icon: MoneyWavy,
    title: "Transaction",
  };
};

export const computeCashbackPeriod = (txDate: Date) => {
  const paymentDate = new Date(txDate);

  const cashbackPeriodStart = new Date(
    paymentDate.setDate(paymentDate.getDate() - paymentDate.getDay() - 7),
  );

  const cashbackPeriodEnd = new Date(cashbackPeriodStart);
  cashbackPeriodEnd.setDate(cashbackPeriodStart.getDate() + 6);

  return {
    cashbackPeriodStart,
    cashbackPeriodEnd,
  };
};
