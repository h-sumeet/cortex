import express, { json, urlencoded, type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import healthRoutes from "./routes/health";
import providerRoutes from "./routes/providers";
import topicRoutes from "./routes/topics";
import questionRoutes from "./routes/questions";
import { config } from "./config/app";
import { connect } from "./config/mongodb";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { logger } from "./helpers/logger";
import { formatTimestamp } from "./utils/dayjs";

// Initialize middleware configuration for the Express application
const initializeMiddlewares = (app: Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  // CORS configuration with environment-based origins
  app.use(
    cors({
      origin: config.cors.length > 0 ? config.cors : false,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: [""],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Request parsing middleware with stricter limits
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));

  // Logging middleware with custom format including IP
  app.use(
    morgan((tokens, req, res) => {
      const ip = tokens["remote-addr"]?.(req, res) || "-";
      const url = tokens["url"]?.(req, res) || "-";
      const status = tokens["status"]?.(req, res) || "-";
      const userAgent = tokens["user-agent"]?.(req, res) || "-";

      return `info [${formatTimestamp()}] [${ip}] "${url}" ${status} "${userAgent}"`;
    })
  );
};

// Initialize routes for the Express application
const initializeRoutes = (app: Application): void => {
  app.use("/api/health", healthRoutes);
  app.use("/api/v1/providers", providerRoutes);
  app.use("/api/v1/topics", topicRoutes);
  app.use("/api/v1/questions", questionRoutes);
};

// Initialize error handling for the Express application
const initializeErrorHandling = (app: Application): void => {
  app.use(notFound); // 404 Not Found handler
  app.use(errorHandler); // Global error handler
};

// Create and configure Express application
export const createApp = (): Application => {
  const app = express();

  initializeMiddlewares(app);
  initializeRoutes(app);
  initializeErrorHandling(app);

  return app;
};

// Start the server with database connection
export const startServer = async (): Promise<Application> => {
  try {
    // Connect to database
    await connect();
    const app = createApp();

    // Start server
    app.listen(config.port, () => {
      logger.info(`${config.app.name} server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: ${config.app.url}/api/health`);
    });

    return app;
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Get configured Express application
export const getApp = (): Application => createApp();
