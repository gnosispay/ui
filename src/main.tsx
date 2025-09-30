import { Buffer } from "buffer";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

// Clickjacking protection - prevent the app from running in an iframe
if (window.self !== window.top) {
  // If we're in an iframe, redirect the top window to our URL
  try {
    window.top!.location.href = window.location.href;
  } catch (error) {
    // If we can't access the top window (cross-origin), show a warning
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: var(--color-background, #ffffff);
        color: var(--color-foreground, #000000);
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="margin-bottom: 1rem; color: var(--color-error, #dc2626);">
            Security Warning
          </h1>
          <p style="margin-bottom: 1rem;">
            For your security, this application cannot be displayed in a frame.
          </p>
          <a 
            href="${window.location.href}" 
            target="_top"
            style="
              color: var(--color-brand, #16a34a);
              text-decoration: underline;
              font-weight: 500;
            "
          >
            Open Gnosis Pay in a new window
          </a>
        </div>
      </div>
    `;
    throw new Error("Application blocked: running in iframe");
  }
}

import { client } from "./client/client.gen.ts";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { UserContextProvider } from "./context/UserContext.tsx";
import { CardsContextProvider } from "./context/CardsContext.tsx";
import { Toaster } from "sonner";
import { DelayRelayContextProvider } from "./context/DelayRelayContext.tsx";
import { CardTransactionsContextProvider } from "./context/CardTransactionsContext.tsx";
import { OnchainTransactionsContextProvider } from "./context/OnchainTransactionsContext.tsx";
import { IbanTransactionsContextProvider } from "./context/IbanTransactionsContext.tsx";
import { OrdersContextProvider } from "./context/OrdersContext.tsx";
import { RainbowKitWrapper } from "./context/CustomRainbowKitProvider.tsx";
import { ZendeskProvider } from "react-use-zendesk";

export const BASE_URL = import.meta.env.VITE_GNOSIS_PAY_API_BASE_URL || "https://api.gnosispay.com/";
export const zendeskKey = import.meta.env.VITE_ZENDESK_KEY;

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!zendeskKey) {
  console.warn("VITE_ZENDESK_API_KEY is not set");
}

client.setConfig({
  // set default base url for requests
  baseUrl: BASE_URL,
});

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="system" storageKey="gp-ui-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitWrapper>
            <AuthContextProvider>
              <UserContextProvider>
                <ZendeskProvider apiKey={zendeskKey}>
                  <CardsContextProvider>
                    <OrdersContextProvider>
                      <CardTransactionsContextProvider>
                        <OnchainTransactionsContextProvider>
                          <IbanTransactionsContextProvider>
                            <DelayRelayContextProvider>
                              <App />
                              <Toaster offset={{ right: "6rem", bottom: "1rem" }} expand />
                            </DelayRelayContextProvider>
                          </IbanTransactionsContextProvider>
                        </OnchainTransactionsContextProvider>
                      </CardTransactionsContextProvider>
                    </OrdersContextProvider>
                  </CardsContextProvider>
                </ZendeskProvider>
              </UserContextProvider>
            </AuthContextProvider>
          </RainbowKitWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
