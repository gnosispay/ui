import { Buffer } from "buffer";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./index.css";
import { client } from "./client/client.gen.ts";
import { AuthContextProvider } from "./context/AuthContext.tsx";

const PROD_BASE_URL = "https://api.gnosispay.com/";
export const BASE_URL = import.meta.env.VITE_BASE_URL || PROD_BASE_URL;
export const LOCALSTORAGE_JWT_KEY = "gp-ui.jwt";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

client.setConfig({
  // set default base url for requests
  baseUrl: BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem(LOCALSTORAGE_JWT_KEY) || ""}`,
  },
});

ReactDOM.createRoot(rootElement).render(
  <ThemeProvider defaultTheme="system" storageKey="gp-ui-theme">
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ThemeProvider>,
);
