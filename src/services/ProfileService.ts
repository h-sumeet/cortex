import prisma from "../config/prisma";
import type { UserTopicData } from "../types/profile";
import { throwError } from "../utils/response";
import { getCache, setCache, deleteCache } from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL } from "../constants/cache";
import { getTopicBySlug } from "./TopicService";
import { ERRORS_MSG } from "../constants/error";

/**
 * Get or create user profile record
 */
const getOrCreateProfile = async (userId: string) => {
  const cacheKey = CACHE_KEYS.PROFILE.BY_USER_ID(userId);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  let profile = await prisma.profile.findFirst({
    where: { user_id: userId },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        user_id: userId,
        topics: [],
      },
    });
  }

  await setCache(cacheKey, profile, CACHE_TTL.FIVE_MINUTES);
  return profile;
};

/**
 * Clear profile cache
 */
const clearProfileCache = async (userId: string): Promise<void> => {
  await deleteCache(CACHE_KEYS.PROFILE.BY_USER_ID(userId));
};

/**
 * Get bookmarked seq_no list for a topic
 */
export const getTopicBookmarks = async (
  userId: string,
  topicSlug: string
): Promise<number[]> => {
  const topic = await getTopicBySlug(topicSlug);
  
  if (!topic) {
    throwError(ERRORS_MSG.TOPIC_NOT_FOUND, 404);
  }

  const profile = await getOrCreateProfile(userId);
  const topics = profile.topics as UserTopicData[];

  const topicData = topics.find((t) => t.topic_id === topic.id);
  return topicData?.bookmarked ?? [];
};

/**
 * Check if a question is bookmarked
 */
export const isBookmarked = async (
  userId: string,
  topicSlug: string,
  seqNo: number
): Promise<boolean> => {
  const bookmarks = await getTopicBookmarks(userId, topicSlug);
  return bookmarks.includes(seqNo);
};

/**
 * Toggle bookmark for a question
 */
export const toggleBookmark = async (
  userId: string,
  topicSlug: string,
  seqNo: number
): Promise<boolean> => {
  const topic = await getTopicBySlug(topicSlug);


  if (!topic) {
    throwError(ERRORS_MSG.TOPIC_NOT_FOUND, 404);
  }

  // Validate seq_no
  if (seqNo < 1 || seqNo > topic.qn_count) {
    throwError(ERRORS_MSG.INVALID_SEQ_NO, 400);
  }

  const profile = await getOrCreateProfile(userId);
  const topics = profile.topics as UserTopicData[];

  let topicIndex = topics.findIndex((t) => t.topic_id === topic.id);
  let isNowBookmarked: boolean;

  if (topicIndex === -1) {
    // Create new topic entry with bookmark
    topics.push({ topic_id: topic.id, bookmarked: [seqNo] });
    isNowBookmarked = true;
  } else {
    const topicData = topics[topicIndex]!;
    const bookmarkIndex = topicData.bookmarked.indexOf(seqNo);

    if (bookmarkIndex === -1) {
      // Add bookmark
      topicData.bookmarked.push(seqNo);
      isNowBookmarked = true;
    } else {
      // Remove bookmark
      topicData.bookmarked.splice(bookmarkIndex, 1);
      isNowBookmarked = false;
    }

    topics[topicIndex] = topicData;
  }

  // Remove empty topic entries
  const filteredTopics = topics.filter((t) => t.bookmarked.length > 0);

  await prisma.profile.update({
    where: { id: profile.id },
    data: { topics: filteredTopics },
  });

  await clearProfileCache(userId);

  return isNowBookmarked;
};

/**
 * Clear all bookmarks for a topic
 */
export const clearTopicBookmarks = async (
  userId: string,
  topicSlug: string
): Promise<void> => {
  const topic = await getTopicBySlug(topicSlug);

  if (!topic) {
    throwError(ERRORS_MSG.TOPIC_NOT_FOUND, 404);
  }

  const profile = await getOrCreateProfile(userId);
  const topics = profile.topics as UserTopicData[];

  const updatedTopics = topics.filter((t) => t.topic_id !== topic.id);

  await prisma.profile.update({
    where: { id: profile.id },
    data: { topics: updatedTopics },
  });

  await clearProfileCache(userId);
};
