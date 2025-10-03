/**
 * Clickjacking protection utility
 * Prevents the application from running inside iframes to protect against clickjacking attacks
 */

/**
 * Check if the parent frame is from an allowed origin
 */
const isAllowedParent = (): boolean => {
  try {
    // List of allowed parent origins
    const allowedOrigins = ["https://app.safe.global"];

    // Try to get the parent's origin
    if (window.parent && window.parent !== window.self) {
      const parentOrigin = document.referrer;
      if (parentOrigin) {
        const parentUrl = new URL(parentOrigin);
        return allowedOrigins.includes(parentUrl.origin);
      }
    }
    return false;
  } catch {
    // If we can't determine the parent origin, assume it's not allowed
    return false;
  }
};

/**
 * Initialize clickjacking protection
 * This should be called early in the application lifecycle
 */
export const initializeClickjackingProtection = (): void => {
  // Check if we're running in an iframe
  if (window.self !== window.top) {
    // Check if the parent is from an allowed origin
    if (isAllowedParent()) {
      // Allow embedding from trusted origins
      return;
    }

    // If we're in an iframe from an untrusted origin, redirect the top window to our URL
    try {
      if (window.top) {
        window.top.location.href = window.location.href;
      }
    } catch {
      // If we can't access the top window (cross-origin), show a warning using safe DOM methods
      document.body.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          background: var(--color-background, #ffffff);
          color: var(--color-foreground, #000000);
          text-align: center;
          padding: 2rem;
          margin: 0;
        `;

      const container = document.createElement("div");

      const title = document.createElement("h1");
      title.textContent = "Security Warning";
      title.style.cssText = "margin-bottom: 1rem; color: var(--color-error, #dc2626);";

      const message = document.createElement("p");
      message.textContent = "For your security, this application cannot be displayed in a frame.";
      message.style.cssText = "margin-bottom: 1rem;";

      const link = document.createElement("a");
      link.textContent = "Open Gnosis Pay in a new window";
      link.href = window.location.href;
      link.target = "_top";
      link.style.cssText = `
          color: var(--color-brand, #16a34a);
          text-decoration: underline;
          font-weight: 500;
        `;

      container.appendChild(title);
      container.appendChild(message);
      container.appendChild(link);
      document.body.appendChild(container);

      throw new Error("Application blocked: running in iframe");
    }
  }
};
