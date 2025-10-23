import cors from "cors";
import fs from "node:fs";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import path from "node:path";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";
import { tokenRouter } from "./api/token/tokenRouter";

const CORS_CONFIG = {
  // Static origins that are always allowed
  staticOrigins: ["https://verified-pug-renewing.ngrok-free.app", "http://localhost", "https://app.gnosispay.com"],
  // Pattern for dynamic subdomain matching
  patterns: [
    /^https:\/\/([a-zA-Z0-9-]+\.)*gp-ui\.pages\.dev$/,
    /^http:\/\/localhost:[0-9-]+$/,
    /^https:\/\/([a-zA-Z0-9-]+\.)*gnosispay\.com$/,
  ],
};

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in the static whitelist
      if (CORS_CONFIG.staticOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches any of the allowed patterns
      if (CORS_CONFIG.patterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "frame-src": ["https://api-pse-public.gnosispay.com"],
      },
    },
  }),
);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/token", tokenRouter);

app.get("/native-webview", (_req, res) => {
  const isDevelopment = __dirname.includes("/src");
  const nativeWebviewPath = isDevelopment
    ? path.join(__dirname, "./static/native-webview.html")
    : path.join(__dirname, "./native-webview.html");

  const htmlContent = fs.readFileSync(nativeWebviewPath, "utf-8");

  res.set("Content-Type", "text/html");
  res.send(htmlContent);
});

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
