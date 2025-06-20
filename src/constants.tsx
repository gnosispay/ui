export interface CurrencyInfo {
  tokenSymbol?: string;
  address?: string;
  decimals?: number;
  symbol?: string;
  fiatSymbol?: string;
}

export const currencies: Record<string, CurrencyInfo> = {
  EUR: {
    tokenSymbol: "EURe",
    address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E",
    decimals: 18,
    symbol: "€",
    fiatSymbol: "EUR",
  },
  GPB: {
    tokenSymbol: "GBPe",
    address: "0x5Cb9073902F2035222B9749F8fB0c9BFe5527108",
    decimals: 18,
    symbol: "£",
    fiatSymbol: "GPB",
  },
  USD: {
    tokenSymbol: "USDCe",
    address: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0",
    decimals: 6,
    symbol: "$",
    fiatSymbol: "USD",
  },
};
