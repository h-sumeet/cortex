import prisma from "../config/prisma";
import type {
  CreateProviderInput,
  UpdateProviderInput,
  ProviderWithTopics,
} from "../types/provider";
import {
  getCache,
  setCache,
  clearProviderCache,
  clearProviderCacheById,
} from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL } from "../constants/cache";

export const createProvider = async (data: CreateProviderInput) => {
  const provider = await prisma.provider.create({
    data,
  });

  // Clear all providers cache
  await clearProviderCache();

  return provider;
};

export const getAllProviders = async () => {
  const cacheKey = CACHE_KEYS.PROVIDERS.ALL;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get from database
  const providers = await prisma.provider.findMany({
    orderBy: { created_at: "desc" },
  });

  // Set cache
  await setCache(cacheKey, providers, CACHE_TTL.ONE_DAY);

  return providers;
};

export const getProviderById = async (
  id: string
): Promise<ProviderWithTopics | null> => {
  const cacheKey = CACHE_KEYS.PROVIDERS.BY_ID(id);

  // Try to get from cache
  const cached = await getCache<ProviderWithTopics>(cacheKey);
  if (cached) return cached;

  // Get from database
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { topics: true },
  });

  // Set cache
  if (provider) {
    await setCache(cacheKey, provider, CACHE_TTL.ONE_DAY);
  }

  return provider;
};

export const getProviderBySlug = async (
  slug: string
): Promise<ProviderWithTopics | null> => {
  const cacheKey = CACHE_KEYS.PROVIDERS.BY_SLUG(slug);

  // Try to get from cache
  const cached = await getCache<ProviderWithTopics>(cacheKey);
  if (cached) return cached;

  // Get from database
  const provider = await prisma.provider.findUnique({
    where: { provider_slug: slug },
    include: { topics: true },
  });

  // Set cache
  if (provider) {
    await setCache(cacheKey, provider, CACHE_TTL.ONE_DAY);
  }

  return provider;
};

export const updateProvider = async (id: string, data: UpdateProviderInput) => {
  const provider = await prisma.provider.update({
    where: { id },
    data,
  });

  // Clear provider cache
  await clearProviderCacheById(id);
  await clearProviderCache();

  return provider;
};

export const deleteProvider = async (id: string) => {
  const provider = await prisma.provider.delete({
    where: { id },
  });

  // Clear provider cache
  await clearProviderCacheById(id);
  await clearProviderCache();

  return provider;
};

export const incrementTopicCount = async (providerId: string) => {
  const provider = await prisma.provider.update({
    where: { id: providerId },
    data: { topic_count: { increment: 1 } },
  });

  // Clear provider cache
  await clearProviderCacheById(providerId);

  return provider;
};

export const decrementTopicCount = async (providerId: string) => {
  const provider = await prisma.provider.update({
    where: { id: providerId },
    data: { topic_count: { decrement: 1 } },
  });

  // Clear provider cache
  await clearProviderCacheById(providerId);

  return provider;
};
