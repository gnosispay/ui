import { Buffer } from "buffer";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { wagmiConfig } from "./wagmi.ts";
import { WalletProvider } from "./components/WalletProvider.tsx";

import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import { client } from "./client/client.gen.ts";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { UserContextProvider } from "./context/UserContext.tsx";
import { CardsContextProvider } from "./context/CardsContext.tsx";
import { Toaster } from "sonner";
import { DelayRelayContextProvider } from "./context/DelayRelayContext.tsx";
import { CardTransactionsContextProvider } from "./context/CardTransactionsContext.tsx";
import { OnchainTransactionsContextProvider } from "./context/OnchainTransactionsContext.tsx";
import { OrdersContextProvider } from "./context/OrdersContext.tsx";
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
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <AuthContextProvider>
              <UserContextProvider>
                <ZendeskProvider apiKey={zendeskKey}>
                  <CardsContextProvider>
                    <OrdersContextProvider>
                      <CardTransactionsContextProvider>
                        <OnchainTransactionsContextProvider>
                          <DelayRelayContextProvider>
                            <App />
                            <Toaster offset={{ right: "6rem", bottom: "1rem" }} expand />
                          </DelayRelayContextProvider>
                        </OnchainTransactionsContextProvider>
                      </CardTransactionsContextProvider>
                    </OrdersContextProvider>
                  </CardsContextProvider>
                </ZendeskProvider>
              </UserContextProvider>
            </AuthContextProvider>
          </WalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
