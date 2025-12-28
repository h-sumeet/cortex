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
  QUESTIONS: {
    BY_ID: (id: string) => `questions:id:${id}`,
    BY_SLUG: (slug: string) => `questions:slug:${slug}`,
    BY_TOPIC_SLUG: (topicSlug: string, limit: number) =>
      `questions:topic:${topicSlug}:limit:${limit}`,
    BY_TOPIC_AND_SEQ: (topicSlug: string, index: number, limit: number) =>
      `questions:topic:${topicSlug}:index:${index}:limit${limit}`,
    BY_TOPIC_AND_TAGS: (topicSlug: string, tags: string, index: number, limit: number) =>
      `questions:topic:${topicSlug}:tags:${tags}:index:${index}:limit:${limit}`,
  },
  PROFILE: {
    BY_USER_ID: (userId: string) => `profile:${userId}`,
  },
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  ONE_DAY: 86400, // 24 hours
  ONE_HOUR: 3600,
  THIRTY_MINUTES: 1800,
  FIVE_MINUTES: 300,
} as const;

// Cache key patterns for bulk operations
export const CACHE_PATTERNS = {
  PROVIDERS: "providers:*",
  TOPICS: "topics:*",
  QUESTIONS: "questions:*",
  PROFILE: "profile:*",
} as const;
