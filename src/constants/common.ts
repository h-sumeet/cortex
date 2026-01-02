export const ENV: Record<string, string> = {
  dev: "development",
  prod: "production",
} as const;

export const SERVICE_NAME = "examaxis" as const;

export const CUSTOM_HEADERS = {
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-refresh-token",
  SERVICE_HEADER: "x-service",
};
