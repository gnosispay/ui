import { test as base } from "@playwright/test";
import { blockPylonWidget } from "./utils/mockPylon";

/**
 * The Pylon chat widget is a third party bundle that opens websockets and floats
 * over the UI, so it is kept out of every test run.
 */
export const test = base.extend<{ pylonWidget: void }>({
  pylonWidget: [
    async ({ page }, use) => {
      await blockPylonWidget(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
