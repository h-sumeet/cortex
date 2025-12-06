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
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockTime: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  discordAlert: string;
}
