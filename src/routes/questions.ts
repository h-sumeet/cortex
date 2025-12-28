import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionBySlug,
  getBookmarkedQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/QuestionController";
import { authenticate, optionalAuth } from "../middleware/auth";

const router = Router();

// Create question
router.post("/", createQuestion);

// Get questions with filters (topic_slug required, optional: seq_no, tags, limit)
router.get("/", optionalAuth, getQuestions);

// Get bookmarked question (requires auth)
router.get("/bookmarked", authenticate, getBookmarkedQuestion);

// Get question by slug (uses optionalAuth for premium check)
router.get("/slug/:slug", optionalAuth, getQuestionBySlug);

// Update question
router.put("/:id", updateQuestion);

// Delete question
router.delete("/:id", deleteQuestion);

export default router;
