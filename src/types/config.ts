export interface IConfig {
  port: number;
  nodeEnv: string;
  mongodb: string;
  redis: string;
  cors: string[];
  logLevel: string;
  version: string;
  app: {
    name: string;
    url: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  discordAlert: string;
  credlockUrl: string;
}
