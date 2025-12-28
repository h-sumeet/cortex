import { Router } from "express";
import {
  getTopicBookmarks,
  checkBookmark,
  toggleBookmark,
  clearTopicBookmarks,
} from "../controllers/ProfileController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get bookmarked seq_no list for a topic
router.post("/bookmark", getTopicBookmarks);

// Check if a question is bookmarked
router.post("/bookmark/check", checkBookmark);

// Toggle bookmark for a question
router.post("/bookmark/toggle", toggleBookmark);

// Clear all bookmarks for a topic
router.post("/bookmark/clear", clearTopicBookmarks);

export default router;
