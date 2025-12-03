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
      // Shim for @safe-global/safe-singleton-factory which uses dynamic require()
      // that doesn't work with Vite bundling
      // see https://github.com/gnosispay/ui/pull/189
      "@safe-global/safe-singleton-factory": path.resolve(__dirname, "./src/shims/safe-singleton-factory.ts"),
    },
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these packages with their JSON assets
    include: ["@gnosispay/account-kit", "@safe-global/safe-deployments"],
  },
  build: {
    commonjsOptions: {
      // Include JSON files when transforming CJS to ESM
      include: [/node_modules/],
    },
  },
  server: {
    allowedHosts: ["verified-pug-renewing.ngrok-free.app"],
    cors: {
      origin: "https://app.safe.global",
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  },
});
