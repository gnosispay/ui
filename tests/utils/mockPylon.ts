import { expect, type Page } from "@playwright/test";

const PYLON_WIDGET_URL = "https://widget.eu.usepylon.com/**";

type PylonQueue = { q?: IArguments[] };

/**
 * Keeps the real widget bundle from loading, so the commands the app sends stay
 * in the loader queue where they can be asserted on.
 */
export async function blockPylonWidget(page: Page) {
  await page.route(PYLON_WIDGET_URL, (route) => route.abort());
}

export async function expectPylonCommand(page: Page, command: string) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const queue = (window as unknown as { Pylon?: PylonQueue }).Pylon?.q ?? [];
        return queue.map((args) => String(args[0]));
      }),
    )
    .toContain(command);
}
