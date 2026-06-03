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
  const { isAuthenticated } = useAuth();
  const [migration, setMigration] = useState<SafeMigrationInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMigration = useCallback(() => {
    setIsLoading(true);

    getApiV1SafeMigration()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching safe migration:", error);
          return;
        }

        setMigration(data);
      })
      .catch((error) => {
        console.error("Error fetching safe migration:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
