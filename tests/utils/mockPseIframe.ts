import type { Page } from "@playwright/test";

/**
 * Configuration for mocking the PSE iframe endpoint
 */
export interface PseIframeMockOptions {
  /** Custom iframe host URL (default: "https://api-pse-public.gnosispay.com") */
  iframeHost?: string;
  /** Custom HTML content for the iframe (default: PIN setup interface) */
  htmlContent?: string;
  /** Action type to send when button is clicked (default: "DoneSettingPin") */
  actionType?: string;
  /** Custom button text (default: "Complete PIN Setup") */
  buttonText?: string;
}

/**
 * Default HTML content for the PSE PIN setup iframe
 */
const DEFAULT_PIN_SETUP_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>PSE PIN Setup</title>
  </head>
  <body>
    <div id="pse-pin-setup">
      <h1>PIN Setup Interface</h1>
      <p>Please enter your card PIN</p>
      <button id="complete-pin-setup">Complete PIN Setup</button>
    </div>
    <script>
      // Handle button click to send success message to parent
      document.getElementById("complete-pin-setup").addEventListener("click", function() {
        // Send DoneSettingPin message to parent window
        // This will trigger onActionSuccess callback in the SDK
        if (window.parent) {
          window.parent.postMessage(
            {
              type: "DoneSettingPin"
            },
            "*" // In test, we'll accept any origin
          );
        }
      });
    </script>
  </body>
</html>
`;

/**
 * Generates HTML content for the PSE iframe with customizable action type and button text
 */
function generateIframeHtml(actionType: string, buttonText: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>PSE PIN Setup</title>
  </head>
  <body>
    <div id="pse-pin-setup">
      <h1>PIN Setup Interface</h1>
      <p>Please enter your card PIN</p>
      <button id="complete-pin-setup">${buttonText}</button>
    </div>
    <script>
      // Handle button click to send success message to parent
      document.getElementById("complete-pin-setup").addEventListener("click", function() {
        // Send action message to parent window
        // This will trigger onActionSuccess callback in the SDK
        if (window.parent) {
          window.parent.postMessage(
            {
              type: "${actionType}"
            },
            "*" // In test, we'll accept any origin
          );
        }
      });
    </script>
  </body>
</html>
`;
}

/**
 * Sets up a mock for the PSE iframe endpoint (`https://api-pse-public.gnosispay.com/**`) in Playwright tests.
 *
 * This function intercepts GET requests to the PSE iframe endpoint and returns
 * HTML content that simulates the PSE SDK iframe behavior, including sending
 * postMessage events to trigger onActionSuccess callbacks.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockPseIframe } from "./utils/mockPseIframe";
 *
 * test("PIN setup flow", async ({ page }) => {
 *   await mockPseIframe(page, {
 *     actionType: "DoneSettingPin",
 *     buttonText: "Complete PIN Setup"
 *   });
 * });
 * ```
 */
export async function mockPseIframe(page: Page, options: PseIframeMockOptions = {}): Promise<void> {
  const {
    iframeHost = "https://api-pse-public.gnosispay.com",
    htmlContent,
    actionType = "DoneSettingPin",
    buttonText = "Complete PIN Setup",
  } = options;

  // Use custom HTML content if provided, otherwise generate default
  const finalHtmlContent =
    htmlContent || generateIframeHtml(actionType, buttonText);

  await page.route(`${iframeHost}/**`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: finalHtmlContent,
      });
    } else {
      await route.continue();
    }
  });
}

