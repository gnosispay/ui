import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
	HOST: z.string().min(1).default("localhost"),
	PORT: z.coerce.number().int().positive().default(8080),
	CORS_ORIGIN: z.string().url().default("http://localhost:8080"),
	CLIENT_CERT: z.string().min(1).default(""),
	CLIENT_KEY: z.string().min(1).default(""),
	GNOSIS_PSE_API_URL: z.string().url().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = {
	...parsedEnv.data,
	isDevelopment: parsedEnv.data.NODE_ENV === "development",
	isProduction: parsedEnv.data.NODE_ENV === "production",
	isTest: parsedEnv.data.NODE_ENV === "test",
};
