import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "node:process";

const envFilePath = join(process.cwd(), ".env");
if (existsSync(envFilePath)) {
  loadEnvFile(envFilePath);
}

const DEFAULT_API_PORT = 3001;
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";

type ServerEnv = {
  nodeEnv: string;
  databaseUrl: string;
  apiPort: number;
  adminApiSecret: string;
  corsOrigin: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseApiPort = (): number => {
  const rawPort = process.env.API_PORT;
  if (!rawPort) {
    return DEFAULT_API_PORT;
  }

  const parsed = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535");
  }

  return parsed;
};

export const env: ServerEnv = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  apiPort: parseApiPort(),
  adminApiSecret: getRequiredEnv("ADMIN_API_SECRET"),
  corsOrigin: process.env.FRONTEND_ORIGIN ?? DEFAULT_FRONTEND_ORIGIN,
};
