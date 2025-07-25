export function shortenAddress(address: string): string {
  if (!address) {
    console.warn("No address provided for shortening");
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
