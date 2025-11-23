import { startServer } from "./app";
import { logger } from "./helpers/logger";

// Start the server
const server = await startServer();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", async (error: Error) => {
  logger.error("Unhandled Rejection", { error });
  process.exit(1);
});

process.on("uncaughtException", async (error: Error) => {
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

export default server;
