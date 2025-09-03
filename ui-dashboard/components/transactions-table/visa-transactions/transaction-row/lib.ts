import { EventKind, PaymentStatus, type Event } from "@gnosispay/types";

export const getTransactionDeclineReason = (transaction: Event) => {
  if (
    transaction.kind !== EventKind.Payment ||
    !isTransactionDeclined(transaction)
  ) {
    return null;
  }

  switch (transaction.status) {
    case PaymentStatus.IncorrectPin:
      return "Incorrect PIN";

    case PaymentStatus.InsufficientFunds:
      return "Insufficient funds or allowance";

    case PaymentStatus.InvalidAmount:
      return "Invalid amount";

    case PaymentStatus.PinEntryTriesExceeded:
      return "PIN entry tries exceeded";

    case PaymentStatus.IncorrectSecurityCode:
      return "Incorrect security code";

    default:
      return "Declined";
  }
};

export const isTransactionDeclined = (transaction: Event) => {
  const declinedStatuses = [
    PaymentStatus.IncorrectPin,
    PaymentStatus.InsufficientFunds,
    PaymentStatus.InvalidAmount,
    PaymentStatus.PinEntryTriesExceeded,
    PaymentStatus.IncorrectSecurityCode,
    PaymentStatus.Other,
  ];

  return (
    transaction.kind === EventKind.Payment &&
    declinedStatuses.includes(transaction.status)
  );
};

export const isTransactionRefundOrReversal = (transaction: Event) => {
  return [EventKind.Refund, EventKind.Reversal].includes(transaction.kind);
};

export const computeTransactionExchangeRate = ({
  billingAmount,
  transactionAmount,
}: {
  billingAmount: bigint;
  transactionAmount: bigint;
}) => Number(billingAmount) / Number(transactionAmount);

export const formatTransactionExchangeRate = (exchangeRate: number) => {
  const decimalPlacesToTake = 2;

  let formattedExchangeRate = exchangeRate.toFixed(decimalPlacesToTake);

  /**
   * In the exchange rate we need to show the first two non-zero digits after the decimal place.
   *
   * If the rate is smaller than `0.01`, we format it to follow this rule.
   */
  if (exchangeRate < 0.01) {
    const nonZeroDecimalPlaces =
      (exchangeRate.toString().split(".")[1] ?? "0").search(/[^0]/) +
      decimalPlacesToTake;

    formattedExchangeRate = exchangeRate.toFixed(nonZeroDecimalPlaces);
  }

  return formattedExchangeRate;
};
