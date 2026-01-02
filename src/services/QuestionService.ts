import prisma from "../config/prisma";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionWithTopic,
  QuestionsResult,
} from "../types/question";
import { getCache, setCache, deleteCachePattern } from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS } from "../constants/cache";
import { QUESTION_DEFAULTS } from "../constants/question";
import { SERVICE_NAME } from "../constants/common";
import { checkSubscriptionStatus } from "./SubscriptionService";
import { throwError } from "../utils/response";
import { getTopicBySlug } from "./TopicService";
import { ERRORS_MSG } from "../constants/error";

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
 * Check if a question exists at a given seq_no for a topic
 */
export const questionExistsAtSeqNo = async (
  topicId: string,
  seqNo: number
): Promise<boolean> => {
  const question = await prisma.question.findFirst({
    where: {
      topic_id: topicId,
      seq_no: seqNo,
    },
    select: { id: true },
  });

  return !!question;
};

/**
 * Shift seq_no of questions starting from a given seq_no
 * Increments seq_no of all questions >= seqNo by 1
 */
export const shiftSeqNos = async (
  topicId: string,
  fromSeqNo: number
): Promise<void> => {
  await prisma.question.updateMany({
    where: {
      topic_id: topicId,
      seq_no: { gte: fromSeqNo },
    },
    data: {
      seq_no: { increment: 1 },
    },
  });

  await clearQuestionCache();
};

/**
 * Create a new question
 * If seq_no is provided and exists, shifts other questions first
 */
export const createQuestion = async (
  data: CreateQuestionInput & { qn_slug: string }
) => {
  // Check if seq_no already exists and shift if needed
  const exists = await questionExistsAtSeqNo(data.topic_id, data.seq_no);
  if (exists) {
    await shiftSeqNos(data.topic_id, data.seq_no);
  }

  const question = await prisma.question.create({
    data,
    include: { topic: true },
  });

  await clearQuestionCache();

  return question;
};

/**
 * Get question by slug
 */
export const getQuestionBySlug = async (
  slug: string
): Promise<QuestionWithTopic | null> => {
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_SLUG(slug);

  const cached = await getCache<QuestionWithTopic>(cacheKey);
  if (cached) return cached;

  const question = await prisma.question.findUnique({
    where: { qn_slug: slug },
    include: { topic: true },
  });

  if (question && question.status !== "published") {
    return null;
  }

  if (question) {
    await setCache(cacheKey, question, CACHE_TTL.ONE_DAY);
  }

  return question;
};

/**
 * Get question by ID
 */
export const getQuestionById = async (
  id: string
): Promise<QuestionWithTopic | null> => {
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_ID(id);

  const cached = await getCache<QuestionWithTopic>(cacheKey);
  if (cached) return cached;

  const question = await prisma.question.findUnique({
    where: { id },
    include: { topic: true },
  });

  if (question) {
    await setCache(cacheKey, question, CACHE_TTL.ONE_DAY);
  }

  return question;
};

/**
 * Get questions starting from a specific index with limit
 * Returns questions in ascending order of seq_no
 */
export const getQuestionByIndex = async (
  topicSlug: string,
  index: number,
  limit: number = QUESTION_DEFAULTS.FETCH_LIMIT
): Promise<QuestionsResult | null> => {
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_TOPIC_AND_SEQ(
    topicSlug,
    index,
    limit
  );

  const cached = await getCache<QuestionsResult>(cacheKey);
  if (cached) return cached;

  const topic = await getTopicBySlug(topicSlug);
  if (!topic) return null;

  const whereClause = {
    topic_id: topic.id,
    status: "published" as const,
  };

  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { seq_no: "asc" as const },
    skip: index - 1,
    take: limit,
    include: { topic: true },
  });

  const totalCount = await prisma.question.count({
    where: whereClause,
  });

  const result = {
    questions,
    totalCount,
  };

  if (questions.length > 0) {
    await setCache(cacheKey, result, CACHE_TTL.ONE_DAY);
  }

  return result;
};

/**
 * Get questions by topic slug and tags with pagination
 * Returns questions that match ANY of the provided tags (OR condition)
 * Starting from a specific index with limit, ordered by seq_no ascending
 */
export const getQuestionsByTags = async (
  topicSlug: string,
  index: number,
  tags: string[],
  limit: number = QUESTION_DEFAULTS.FETCH_LIMIT
): Promise<QuestionsResult> => {
  const tagsKey = tags.sort().join(",");
  const cacheKey = CACHE_KEYS.QUESTIONS.BY_TOPIC_AND_TAGS(
    topicSlug,
    tagsKey,
    index,
    limit
  );

  const cached = await getCache<QuestionsResult>(cacheKey);
  if (cached) return cached;

  const topic = await getTopicBySlug(topicSlug);

  if (!topic) {
    throwError("Topic not found", 404);
  }

  const whereClause = {
    topic_id: topic.id,
    status: "published" as const,
    tags: { hasSome: tags },
  };

  const totalCount = await prisma.question.count({
    where: whereClause,
  });

  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { seq_no: "asc" as const },
    skip: index - 1,
    take: limit,
    include: { topic: true },
  });

  const result = {
    questions,
    totalCount,
  };

  await setCache(cacheKey, result, CACHE_TTL.ONE_DAY);

  return result;
};

/**
 * Get bookmarked question by seq_no from list of bookmarked seq_nos
 */
export const getBookmarkedQuestions = async (
  topicSlug: string,
  index: number,
  bookmarkedSeqNos: number[],
  limit: number = QUESTION_DEFAULTS.FETCH_LIMIT
): Promise<QuestionsResult | null> => {
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) return null;

  // Verify the seq_no is in the bookmarked list
  if (bookmarkedSeqNos.length === 0) {
    return { questions: [], totalCount: 0 };
  }

  const whereClause = {
    topic_id: topic.id,
    status: "published" as const,
    seq_no: { in: bookmarkedSeqNos },
  };

  const questions = await prisma.question.findMany({
    where: whereClause,
    orderBy: { seq_no: "asc" as const },
    skip: index - 1,
    take: limit,
    include: { topic: true },
  });

  return {
    questions,
    totalCount: bookmarkedSeqNos.length,
  };
};

/**
 * Update a question
 */
export const updateQuestion = async (
  id: string,
  data: UpdateQuestionInput & { qn_slug?: string }
) => {
  // Check if question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    return null;
  }

  const question = await prisma.question.update({
    where: { id },
    data,
    include: { topic: true },
  });

  await clearQuestionCache();

  return question;
};

/**
 * Delete a question
 */
export const deleteQuestion = async (id: string) => {
  // Check if question exists
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestion) {
    return null;
  }

  const question = await prisma.question.delete({
    where: { id },
  });

  await clearQuestionCache();

  return question;
};

/**
 * Clear all question-related cache
 */
export const clearQuestionCache = async (): Promise<void> => {
  await deleteCachePattern(CACHE_PATTERNS.QUESTIONS);
};

/**
 * Filter out premium questions for non-premium users
 * Returns all questions if user is premium, otherwise filters by is_premium field
 * @throws {Error} When single question is premium and user lacks access
 */
export const filterPremiumQuestions = async (
  questions: QuestionWithTopic | QuestionWithTopic[],
  userId: string | undefined
): Promise<QuestionWithTopic[]> => {
  const questionsArray = Array.isArray(questions) ? questions : [questions];
  const isSingleQuestion = !Array.isArray(questions) || questions.length === 1;

  if (questionsArray.length === 0) {
    return questionsArray;
  }

  // Check if any question is premium
  const hasPremiumQuestions = questionsArray.some((q) => q.is_premium);
  if (!hasPremiumQuestions) {
    return questionsArray;
  }

  const firstQuestion = questionsArray[0];
  if (!firstQuestion) {
    throwError("Question data not found");
  }

  // If user is not logged in, filter out premium questions
  if (!userId) {
    const filtered = questionsArray.filter((q) => !q.is_premium);
    return handleFilteredResult(filtered, isSingleQuestion);
  }

  // Check premium status with external service
  const premiumStatus = await checkSubscriptionStatus(
    userId,
    SERVICE_NAME,
    firstQuestion.topic_id
  );

  if (premiumStatus.is_premium) {
    return questionsArray;
  }

  // Filter out premium questions for non-premium users
  const filtered = questionsArray.filter((q) => !q.is_premium);
  return handleFilteredResult(filtered, isSingleQuestion);
};

/**
 * Helper function to handle filtered question results
 * @throws {Error} When single question filtered out
 */
const handleFilteredResult = (
  filtered: QuestionWithTopic[],
  isSingleQuestion: boolean
): QuestionWithTopic[] => {
  if (isSingleQuestion && filtered.length === 0) {
    throwError(ERRORS_MSG.PREMIUM_REQUIRED);
  }
  return filtered;
};
