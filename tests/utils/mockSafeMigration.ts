import type { Page } from "@playwright/test";
import type { SafeMigrationInfo } from "../../src/client/types.gen";

export interface SafeMigrationMockData {
  hasOldSafe: boolean;
  oldSafeAddress?: string;
  newSafeAddress?: string;
  status?: SafeMigrationInfo["status"];
}

export async function mockSafeMigration({ page, data }: { page: Page; data: SafeMigrationMockData }): Promise<void> {
  await page.route("**/api/v1/safe/migration", async (route) => {
    if (route.request().method() === "GET") {
      const body: SafeMigrationInfo = {
        migrationId: "mock-migration-id",
        hasOldSafe: data.hasOldSafe,
        status: data.status ?? "COMPLETED",
        ...(data.oldSafeAddress && {
          oldSafe: {
            address: data.oldSafeAddress,
            chainId: "100",
            recordedAt: new Date().toISOString(),
          },
        }),
        ...(data.newSafeAddress && {
          newSafe: {
            address: data.newSafeAddress,
            chainId: "100",
            tokenSymbol: "EURe",
          },
        }),
      };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
    } else {
      await route.continue();
    }
  });
}
