import type { Request, Response, NextFunction } from "express";
import * as ProfileService from "../services/ProfileService";
import { sendSuccess, throwError } from "../utils/response";

/**
 * Get bookmarked seq_no list for a topic
 * POST /api/v1/profile/bookmark
 * Body: { topic_slug }
 */
export const getTopicBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic_slug } = req.body as { topic_slug?: string };

    if (!topic_slug) {
      throwError("topic_slug is required", 400);
    }

    const bookmarks = await ProfileService.getTopicBookmarks(
      userId,
      topic_slug
    );

    sendSuccess(res, "Bookmarks retrieved successfully", { bookmarks });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a question is bookmarked
 * POST /api/v1/profile/bookmark/check
 * Body: { topic_slug, seq_no }
 */
export const checkBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic_slug, seq_no } = req.body as {
      topic_slug?: string;
      seq_no?: number | string;
    };

    if (!topic_slug) {
      throwError("topic_slug is required", 400);
    }
    if (seq_no === undefined || seq_no === null) {
      throwError("seq_no is required", 400);
    }

    // Ensure seq_no is a number
    const seqNoNumber = typeof seq_no === "string" ? parseInt(seq_no, 10) : seq_no;

    if (isNaN(seqNoNumber)) {
      throwError("seq_no must be a valid number", 400);
    }

    const isBookmarked = await ProfileService.isBookmarked(
      userId,
      topic_slug,
      seqNoNumber
    );

    sendSuccess(res, "Bookmark status retrieved", {
      is_bookmarked: isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle bookmark for a question
 * POST /api/v1/profile/bookmark/toggle
 * Body: { topic_slug, seq_no }
 */
export const toggleBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic_slug, seq_no } = req.body as {
      topic_slug?: string;
      seq_no?: number | string;
    };

    if (!topic_slug) {
      throwError("topic_slug is required", 400);
    }
    if (seq_no === undefined || seq_no === null) {
      throwError("seq_no is required", 400);
    }

    // Ensure seq_no is a number
    const seqNoNumber = typeof seq_no === "string" ? parseInt(seq_no, 10) : seq_no;

    if (isNaN(seqNoNumber)) {
      throwError("seq_no must be a valid number", 400);
    }

    const isNowBookmarked = await ProfileService.toggleBookmark(
      userId,
      topic_slug,
      seqNoNumber
    );

    sendSuccess(res, "Bookmark toggled successfully", {
      is_bookmarked: isNowBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all bookmarks for a topic
 * POST /api/v1/profile/bookmark/clear
 * Body: { topic_slug }
 */
export const clearTopicBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic_slug } = req.body as { topic_slug?: string };

    if (!topic_slug) {
      throwError("topic_slug is required", 400);
    }

    await ProfileService.clearTopicBookmarks(userId, topic_slug);

    sendSuccess(res, "Topic bookmarks cleared successfully");
  } catch (error) {
    next(error);
  }
};
