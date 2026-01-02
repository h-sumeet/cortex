import redis from "../config/redis";
import { logger } from "../helpers/logger";
import { CACHE_KEYS, CACHE_PATTERNS } from "../constants/cache";

/**
 * Get data from Redis cache
 */
export const getCache = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error(`Cache get error for key: ${key}`, error);
    return null;
  }
};

/**
 * Set data in Redis cache with TTL
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttl: number
): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error(`Cache set error for key: ${key}`, error);
  }
};

/**
 * Delete specific cache key
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache delete error for key: ${key}`, error);
  }
};

/**
 * Delete multiple cache keys by pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error(`Cache delete pattern error for pattern: ${pattern}`, error);
  }
};

/**
 * Clear all provider-related cache
 */
export const clearProviderCache = async (): Promise<void> => {
  try {
    await deleteCachePattern(CACHE_PATTERNS.PROVIDERS);
    await deleteCachePattern(CACHE_PATTERNS.TOPICS); // Topics depend on providers
    logger.info("Provider cache cleared");
  } catch (error) {
    logger.error("Error clearing provider cache", error);
  }
};

/**
 * Clear all topic-related cache
 */
export const clearTopicCache = async (): Promise<void> => {
  try {
    await deleteCachePattern(CACHE_PATTERNS.TOPICS);
    logger.info("Topic cache cleared");
  } catch (error) {
    logger.error("Error clearing topic cache", error);
  }
};
/**
 * Clear cache for specific provider
 */
export const clearProviderCacheById = async (id: string): Promise<void> => {
  try {
    await deleteCachePattern(`providers:*${id}*`);
    await deleteCache(CACHE_KEYS.PROVIDERS.ALL); // Clear all providers list
    await deleteCachePattern(`topics:provider:${id}*`);
    logger.info(`Cache cleared for provider: ${id}`);
  } catch (error) {
    logger.error(`Error clearing cache for provider: ${id}`, error);
  }
};

/**
 * Clear cache for specific topic
 */
export const clearTopicCacheById = async (id: string): Promise<void> => {
  try {
    await deleteCachePattern(`topics:*${id}*`);
    logger.info(`Cache cleared for topic: ${id}`);
  } catch (error) {
    logger.error(`Error clearing cache for topic: ${id}`, error);
  }
};
