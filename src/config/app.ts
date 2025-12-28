import dotenvx from "@dotenvx/dotenvx";
dotenvx.config({ ignore: ["MISSING_ENV_FILE"] });

import type { IConfig } from "../types/config";
import { getRequiredEnvNumber, getRequiredEnvVar } from "../utils/env";
import { convertToMilliseconds } from "../utils/dayjs";

export const config: IConfig = {
  port: getRequiredEnvNumber("PORT"),
  nodeEnv: getRequiredEnvVar("NODE_ENV"),
  logLevel: getRequiredEnvVar("LOG_LEVEL"),
  version: getRequiredEnvVar("APP_VERSION"),

  app: {
    name: getRequiredEnvVar("APP_NAME"),
    url: `${getRequiredEnvVar("BASE_URL")}:${getRequiredEnvNumber("PORT")}`,
  },

  mongodb: getRequiredEnvVar("MONGODB_URL"),
  redis: getRequiredEnvVar("REDIS_URL"),

  cors: getRequiredEnvVar("CORS_ORIGINS")
    .split(",")
    .map((origin) => origin.trim()),

  rateLimit: {
    windowMs: convertToMilliseconds(getRequiredEnvNumber("RATE_LIMIT_WINDOW")),
    maxRequests: getRequiredEnvNumber("RATE_LIMIT_MAX_REQUESTS"),
  },

  discordAlert: getRequiredEnvVar("DISCORD_WEBHOOK_URL"),
  credlockUrl: getRequiredEnvVar("CREDLOCK_URL"),
};
