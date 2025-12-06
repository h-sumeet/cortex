import prisma from "../config/prisma";
import type { CreateTopicInput, UpdateTopicInput } from "../types/topic";
import { getCache, setCache, clearTopicCache, clearTopicCacheById, clearProviderCacheById } from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL } from "../constants/cache";

export const createTopic = async (data: CreateTopicInput) => {
  const topic = await prisma.topic.create({
    data,
    include: { provider: true },
  });
  
  // Clear topic cache
  await clearTopicCache();
  await clearProviderCacheById(data.provider_id);
  
  return topic;
};

export const getAllTopics = async () => {
  const cacheKey = CACHE_KEYS.TOPICS.ALL;
  
  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  // Get from database
  const topics = await prisma.topic.findMany({
    orderBy: { created_at: "desc" },
    include: { provider: true },
  });
  
  // Set cache
  await setCache(cacheKey, topics, CACHE_TTL.ONE_DAY);
  
  return topics;
};

export const getTopicById = async (id: string) => {
  const cacheKey = CACHE_KEYS.TOPICS.BY_ID(id);
  
  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  // Get from database
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: { provider: true },
  });
  
  // Set cache
  if (topic) {
    await setCache(cacheKey, topic, CACHE_TTL.ONE_DAY);
  }
  
  return topic;
};

export const getTopicBySlug = async (slug: string) => {
  const cacheKey = CACHE_KEYS.TOPICS.BY_SLUG(slug);
  
  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  // Get from database
  const topic = await prisma.topic.findUnique({
    where: { topic_slug: slug },
    include: { provider: true },
  });
  
  // Set cache
  if (topic) {
    await setCache(cacheKey, topic, CACHE_TTL.ONE_DAY);
  }
  
  return topic;
};

export const getTopicsByProviderId = async (providerId: string) => {
  const cacheKey = CACHE_KEYS.TOPICS.BY_PROVIDER_ID(providerId);
  
  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  // Get from database
  const topics = await prisma.topic.findMany({
    where: { provider_id: providerId },
    orderBy: { created_at: "desc" },
  });
  
  // Set cache
  await setCache(cacheKey, topics, CACHE_TTL.ONE_DAY);
  
  return topics;
};

export const updateTopic = async (id: string, data: UpdateTopicInput) => {
  const topic = await prisma.topic.update({
    where: { id },
    data,
    include: { provider: true },
  });
  
  // Clear topic cache
  await clearTopicCacheById(id);
  await clearTopicCache();
  
  // Clear provider cache if provider changed
  if (data.provider_id) {
    await clearProviderCacheById(data.provider_id);
  }
  
  return topic;
};

export const deleteTopic = async (id: string) => {
  const topic = await prisma.topic.delete({
    where: { id },
  });
  
  // Clear topic cache
  await clearTopicCacheById(id);
  await clearTopicCache();
  
  return topic;
};

export const incrementQuestionCount = async (topicId: string) => {
  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { qn_count: { increment: 1 } },
  });
  
  // Clear topic cache
  await clearTopicCacheById(topicId);
  
  return topic;
};

export const decrementQuestionCount = async (topicId: string) => {
  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { qn_count: { decrement: 1 } },
  });
  
  // Clear topic cache
  await clearTopicCacheById(topicId);
  
  return topic;
};
