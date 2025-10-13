import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["verified-pug-renewing.ngrok-free.app", "localhost"],
    cors: {
      origin: ["https://app.safe.global", "https://api.monerium.dev", "http://localhost:5173"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  },
});
