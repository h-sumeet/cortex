// Cache key prefixes
export const CACHE_KEYS = {
  PROVIDERS: {
    ALL: "providers:all",
    BY_ID: (id: string) => `providers:id:${id}`,
    BY_SLUG: (slug: string) => `providers:slug:${slug}`,
  },
  TOPICS: {
    ALL: "topics:all",
    BY_ID: (id: string) => `topics:id:${id}`,
    BY_SLUG: (slug: string) => `topics:slug:${slug}`,
    BY_PROVIDER_ID: (providerId: string) => `topics:provider:${providerId}`,
    BY_PROVIDER_SLUG: (slug: string) => `topics:provider:slug:${slug}`,
  },
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  ONE_DAY: 86400, // 24 hours
  ONE_HOUR: 3600,
  THIRTY_MINUTES: 1800,
} as const;
