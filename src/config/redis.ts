import Redis from 'ioredis';
import { logger } from '../helpers/logger';

const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis: Max reconnection attempts reached');
      return null;
    }
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis: Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  reconnectOnError: (err) => {
    logger.error('Redis: Reconnect on error', err);
    return true;
  },
});

// Event handlers
redis.on('connect', () => {
  logger.info('Redis: Connection established');
});

redis.on('ready', () => {
  logger.info('Redis: Ready to accept commands');
});

redis.on('error', (err) => {
  logger.error('Redis: Error', err);
});

redis.on('close', () => {
  logger.warn('Redis: Connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis: Reconnecting...');
});

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis: Health check failed', error);
    return false;
  }
};

export default redis;