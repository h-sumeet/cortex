import type { NextFunction, Request, Response } from "express";
import { config } from "../config/app";
import { sendSuccess } from "../utils/response";
import { formatTimestamp, formatUptime } from "../utils/dayjs";
import { logger } from "../helpers/logger";
import { checkMongoDBHealth } from "../config/mongodb";

/**
 * Build base health object
 */
const getBaseHealth = () => ({
  status: "healthy",
  timestamp: formatTimestamp(),
  uptime: formatUptime(process.uptime()),
  environment: config.nodeEnv,
  version: config.version,
});

/**
 * Basic Health Check Handler
 */
export const basicHealth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const health = getBaseHealth();
    sendSuccess(res, "Service is healthy", health);
  } catch (error) {
    logger.error("Health check failed", { error });
    next(error);
  }
};

export const detailedHealth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const checks = {
    mongodb: false,
  };

  try {
    // Database check using Prisma
    try {
      checks.mongodb = await checkMongoDBHealth();
    } catch (error) {
      logger.error("Database health check failed", { error });
    }

    // Final response - only return essential health status
    const allHealthy = checks.mongodb;
    const status = allHealthy ? "healthy" : "degraded";

    sendSuccess(res, "Health check successful", {
      ...getBaseHealth(),
      status,
      checks,
    });
  } catch (error) {
    logger.error("Detailed health check failed", { error });
    next(error);
  }
};
