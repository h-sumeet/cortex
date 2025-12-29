import prisma from "../config/prisma";
import type { UserBookmarkData } from "../types/profile";
import { throwError } from "../utils/response";
import { getCache, setCache, deleteCache } from "../utils/cache";
import { CACHE_KEYS, CACHE_TTL } from "../constants/cache";
import { getTopicBySlug } from "./TopicService";
import { ERRORS_MSG } from "../constants/error";

/**
 * Get or create user profile record
 * Handles migration from old 'topics' field to new 'bookmarks' field
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
        bookmarks: [],
      },
    });
  } else {
    // Handle migration from old 'topics' field to new 'bookmarks' field
    const profileData = profile as unknown as Record<string, unknown>;
    if (profileData["topics"] && !profile.bookmarks?.length) {
      const oldTopics = profileData["topics"] as Array<{
        topic_id: string;
        bookmarked: number[];
      }>;
      const migratedBookmarks: UserBookmarkData[] = oldTopics.map((t) => ({
        topic_id: t.topic_id,
        bookmarked_seq_nos: t.bookmarked ?? [],
      }));

      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: { bookmarks: migratedBookmarks },
      });
    }
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
  const bookmarks = profile.bookmarks as UserBookmarkData[];

  const topicData = bookmarks.find((b) => b.topic_id === topic.id);
  return topicData?.bookmarked_seq_nos ?? [];
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
  const bookmarks = profile.bookmarks as UserBookmarkData[];

  let bookmarkIndex = bookmarks.findIndex((b) => b.topic_id === topic.id);
  let isNowBookmarked: boolean;

  if (bookmarkIndex === -1) {
    // Create new bookmark entry for topic
    bookmarks.push({ topic_id: topic.id, bookmarked_seq_nos: [seqNo] });
    isNowBookmarked = true;
  } else {
    const bookmarkData = bookmarks[bookmarkIndex]!;
    const seqNoIndex = bookmarkData.bookmarked_seq_nos.indexOf(seqNo);

    if (seqNoIndex === -1) {
      // Add bookmark
      bookmarkData.bookmarked_seq_nos.push(seqNo);
      isNowBookmarked = true;
    } else {
      // Remove bookmark
      bookmarkData.bookmarked_seq_nos.splice(seqNoIndex, 1);
      isNowBookmarked = false;
    }

    bookmarks[bookmarkIndex] = bookmarkData;
  }

  // Remove empty bookmark entries
  const filteredBookmarks = bookmarks.filter(
    (b) => b.bookmarked_seq_nos.length > 0
  );

  await prisma.profile.update({
    where: { id: profile.id },
    data: { bookmarks: filteredBookmarks },
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
  const bookmarks = profile.bookmarks as UserBookmarkData[];

  const updatedBookmarks = bookmarks.filter((b) => b.topic_id !== topic.id);

  await prisma.profile.update({
    where: { id: profile.id },
    data: { bookmarks: updatedBookmarks },
  });

  await clearProfileCache(userId);
};
