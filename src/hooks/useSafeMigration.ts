import { useCallback, useEffect, useState } from "react";
import {
  getApiV1SafeMigration,
  type SafeMigrationInfo,
  type SafeMigrationOldSafeInfo,
  type SafeMigrationSafeInfo,
} from "@/client";
import { useAuth } from "@/context/AuthContext";

interface UseSafeMigrationResult {
  hasOldSafe: boolean;
  oldSafe: SafeMigrationOldSafeInfo | undefined;
  newSafe: SafeMigrationSafeInfo | undefined;
  status: SafeMigrationInfo["status"] | undefined;
  isLoading: boolean;
}

export const useSafeMigration = (): UseSafeMigrationResult => {
  const { isAuthenticated, getJWT } = useAuth();
  const [migration, setMigration] = useState<SafeMigrationInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMigration = useCallback(() => {
    setIsLoading(true);

    // On a direct navigation, the shared API client's Authorization header may
    // not be set yet at the moment this runs. Resolve a valid token explicitly
    // and pass it on the request so it isn't sent unauthenticated (401).
    getJWT()
      .then((jwt) => {
        if (!jwt) {
          return;
        }

        return getApiV1SafeMigration({
          headers: { Authorization: `Bearer ${jwt}` },
        }).then(({ data, error }) => {
          if (error) {
            console.error("Error fetching safe migration:", error);
            return;
          }

          setMigration(data);
        });
      })
      .catch((error) => {
        console.error("Error fetching safe migration:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getJWT]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchMigration();
  }, [isAuthenticated, fetchMigration]);

  return {
    hasOldSafe: migration?.hasOldSafe ?? false,
    oldSafe: migration?.oldSafe,
    newSafe: migration?.newSafe,
    status: migration?.status,
    isLoading,
  };
};
