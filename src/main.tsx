import { Buffer } from "buffer";
import { ThemeProvider } from "@/context/ThemeContext.tsx";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./index.css";
import { client } from "./client/client.gen.ts";
import { AuthContextProvider } from "./context/AuthContext.tsx";
import { UserContextProvider } from "./context/UserContext.tsx";
import { CardsContextProvider } from "./context/CardsContext.tsx";
import { Toaster } from "sonner";
import { TransactionsContextProvider } from "./context/TransactionsContext.tsx";

export const BASE_URL = import.meta.env.VITE_GNOSIS_PAY_API_BASE_URL || "https://api.gnosispay.com/";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
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
          <RainbowKitProvider>
            <AuthContextProvider>
              <UserContextProvider>
                <CardsContextProvider>
                  <TransactionsContextProvider>
                    <App />
                    <Toaster expand />
                  </TransactionsContextProvider>
                </CardsContextProvider>
              </UserContextProvider>
            </AuthContextProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
