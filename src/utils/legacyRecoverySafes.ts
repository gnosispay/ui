/**
 * Loads the set of "old" Safe addresses that are eligible to see the legacy
 * recovery banner. The list can be large (15k+ entries), so it is shipped as a
 * static asset rather than bundled, and only fetched on demand (i.e. once we
 * already know the connected user has an old Safe to check).
 *
 * The resulting Set is cached at module scope and the in-flight request is
 * de-duplicated, so the asset is downloaded at most once per session and shared
 * across every component that needs it.
 */

const ASSET_URL = "/legacy-recovery-safes.json";

let cache: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

export const loadLegacyRecoverySafes = (): Promise<Set<string>> => {
  if (cache) {
    return Promise.resolve(cache);
  }

  if (!inflight) {
    inflight = fetch(ASSET_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load legacy recovery safes: ${response.status}`);
        }
        return response.json() as Promise<string[]>;
      })
      .then((list) => {
        cache = new Set(list.map((address) => address.toLowerCase()));
        return cache;
      })
      .catch((error) => {
        // Allow a retry on the next call rather than caching the failure.
        inflight = null;
        throw error;
      });
  }

  return inflight;
};
