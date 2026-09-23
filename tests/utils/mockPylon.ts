import { expect, type Page } from "@playwright/test";

const PYLON_WIDGET_URL = "https://widget.usepylon.com/**";

type PylonQueue = { q?: IArguments[] };

/**
 * Keeps the real widget bundle from loading, so the commands the app sends stay
 * in the loader queue where they can be asserted on.
 */
export async function blockPylonWidget(page: Page) {
  await page.route(PYLON_WIDGET_URL, (route) => route.abort());
}

/**
 * Pylon only renders the widget for identified users, so the app has to publish
 * both an email and a name alongside the app id.
 */
export async function expectPylonChatSettings(page: Page, expected: { email: string; name: string }) {
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { pylon?: { chat_settings?: unknown } }).pylon?.chat_settings ?? null),
    )
    .toMatchObject(expected);
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
