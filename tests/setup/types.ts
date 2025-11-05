declare global {
  interface Window {
    mockUserContext: {
      balances: {
        spendable: string;
        pending: string;
      };
      safeConfig: {
        fiatSymbol: string;
      };
    };
    mockUnspendableAmount: {
      unspendableFormatted: string;
      shouldShowAlert: boolean;
    };
  }
}

export {};
