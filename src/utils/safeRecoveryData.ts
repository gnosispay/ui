export interface SafeRecoveryEntry {
  affected: boolean;
  preHackBalanceUsd: number;
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
          const [safe, status, balanceUsd] = line.split(",");
          if (!safe || status === undefined || balanceUsd === undefined) continue;
          const address = safe.trim().toLowerCase();
          const parsedBalance = parseFloat(balanceUsd.trim());
          const balance = Number.isFinite(parsedBalance) ? parsedBalance : 0;
          const affected = status.trim().toLowerCase() === "lost";
          if (data[address]) {
            data[address].preHackBalanceUsd += balance;
            if (affected) data[address].affected = true;
          } else {
            data[address] = { affected, preHackBalanceUsd: balance };
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
