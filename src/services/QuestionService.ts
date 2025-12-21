import prisma from "../config/prisma";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../types/question";
import { getCache, setCache, deleteCachePattern } from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS } from "../constants/cache";
import { QUESTION_DEFAULTS } from "../constants/question";

/**
 * Get the last sequence number for a topic
 */
export const getLastSeqNo = async (topicId: string): Promise<number> => {
  const lastQuestion = await prisma.question.findFirst({
    where: {
      topic_id: topicId,
      status: "published",
    },
    orderBy: { seq_no: "desc" },
    select: { seq_no: true },
  });

  return lastQuestion?.seq_no ?? 0;
};

/**
 * Create a new question
 */
export const createQuestion = async (
  data: CreateQuestionInput & { qn_slug: string }
) => {
  const question = await prisma.question.create({
    data,
    include: { topic: true },
  });

  // Clear question cache
  await clearQuestionCache();

  return question;
};

/**
 * Get question by slug
 */
export const getQuestionBySlug = async (slug: string) => {
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_SLUG(slug);

  // Try cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get from database (only published)
  const question = await prisma.question.findUnique({
    where: { qn_slug: slug },
    include: { topic: true },
  });

  // Only return if published
  if (question && question.status !== "published") {
    return null;
  }

  // Set cache
  if (question) {
    await setCache(cacheKey, question, CACHE_TTL.ONE_DAY);
  }

  return question;
};

/**
 * Get questions by topic slug with optional limit
 */
export const getQuestionsByTopicSlug = async (
  topicSlug: string,
  limit: number = QUESTION_DEFAULTS.FETCH_LIMIT
) => {
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_TOPIC_SLUG(topicSlug, limit);

  // Try cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get topic first
  const topic = await prisma.topic.findUnique({
    where: { topic_slug: topicSlug },
  });

  if (!topic) return null;

  const whereClause = {
    topic_id: topic.id,
    status: "published",
  };

  // Get total count
  const totalCount = await prisma.question.count({
    where: whereClause,
  });

  // Get questions (only published)
  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { seq_no: "asc" },
    take: limit,
    include: { topic: true },
  });

  const result = {
    questions,
    totalCount,
  };

  // Set cache
  await setCache(cacheKey, result, CACHE_TTL.ONE_DAY);

  return result;
};

/**
 * Get question by topic slug and index (1-based)
 * Returns the question at the given index position when ordered by seq_no
 */
export const getQuestionByTopicAndIndex = async (
  topicSlug: string,
  index: number,
  tags?: string[]
) => {
  const cacheKey = tags
    ? CACHE_KEYS.QUESTIONS.BY_TOPIC_AND_TAGS(
        topicSlug,
        tags.sort().join(","),
        index
      )
    : CACHE_KEYS.QUESTIONS.BY_TOPIC_AND_SEQ(topicSlug, index);

  // Try cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get topic first
  const topic = await prisma.topic.findUnique({
    where: { topic_slug: topicSlug },
  });

  if (!topic) return null;

  const whereClause: any = {
    topic_id: topic.id,
    status: "published",
  };

  // Add tags filter if provided
  if (tags && tags.length > 0) {
    whereClause.tags = { hasSome: tags };
  }

  // Get total count
  const totalCount = await prisma.question.count({
    where: whereClause,
  });

  // Get question by index (skip to the index position)
  // Index is 1-based, so we skip (index - 1) records
  const question = await prisma.question.findFirst({
    where: whereClause,
    orderBy: { seq_no: "asc" },
    skip: index - 1,
    take: 1,
    include: { topic: true },
  });

  const result = {
    question,
    totalCount,
  };

  // Set cache
  if (question) {
    await setCache(cacheKey, result, CACHE_TTL.ONE_DAY);
  }

  return result;
};

/**
 * Get questions by topic slug and tags
 */
export const getQuestionsByTopicAndTags = async (
  topicSlug: string,
  tags: string[],
  limit: number = QUESTION_DEFAULTS.FETCH_LIMIT
) => {
  const tagsKey = tags.sort().join(",");
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_TOPIC_AND_TAGS(
    topicSlug,
    tagsKey,
    limit
  );

  // Try cache
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Get topic first
  const topic = await prisma.topic.findUnique({
    where: { topic_slug: topicSlug },
  });

  if (!topic) return null;

  const whereClause = {
    topic_id: topic.id,
    status: "published",
    tags: { hasSome: tags },
  };

  // Get total count
  const totalCount = await prisma.question.count({
    where: whereClause,
  });

  // Get questions matching all tags (only published)
  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { seq_no: "asc" },
    take: limit,
    include: { topic: true },
  });

  const result = {
    questions,
    totalCount,
  };

  // Set cache
  await setCache(cacheKey, result, CACHE_TTL.ONE_DAY);

  return result;
};

/**
 * Update a question
 */
export const updateQuestion = async (
  id: string,
  data: UpdateQuestionInput & { qn_slug?: string }
) => {
  const question = await prisma.question.update({
    where: { id },
    data,
    include: { topic: true },
  });

  // Clear question cache
  await clearQuestionCache();

  return question;
};

/**
 * Delete a question
 */
export const deleteQuestion = async (id: string) => {
  const question = await prisma.question.delete({
    where: { id },
  });

  // Clear question cache
  await clearQuestionCache();

  return question;
};

/**
 * Clear all question-related cache
 */
export const clearQuestionCache = async (): Promise<void> => {
  await deleteCachePattern(CACHE_PATTERNS.QUESTIONS);
};
