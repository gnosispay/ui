export interface SafeRecoveryEntry {
  affected: boolean;
  balance: string;
}

type SafeRecoveryData = Record<string, SafeRecoveryEntry>;

const ASSET_URL = "/safe-recovery-data.csv";

let cache: SafeRecoveryData | null = null;
let inflight: Promise<SafeRecoveryData> | null = null;

export const loadSafeRecoveryData = (): Promise<SafeRecoveryData> => {
  if (cache) {
    return Promise.resolve(cache);
  }

  if (!inflight) {
    inflight = fetch(ASSET_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load safe recovery data: ${response.status}`);
        }
        return response.text();
      })
      .then((csv) => {
        const lines = csv.replace(/\r/g, "").trim().split("\n").slice(1); // skip header row
        const data: SafeRecoveryData = {};
        for (const line of lines) {
          const [address, affected, balance] = line.split(",");
          const trimmedBalance = balance?.trim();
          if (address && affected !== undefined && trimmedBalance !== undefined) {
            const parsedBalance = parseFloat(trimmedBalance);
            data[address.trim().toLowerCase()] = {
              affected: affected.trim() === "true",
              balance: Number.isFinite(parsedBalance) ? trimmedBalance : "0",
            };
          }
        }
        cache = data;
        return cache;
      })
      .catch((error) => {
        inflight = null;
        throw error;
      });
  }

  return inflight;
};
