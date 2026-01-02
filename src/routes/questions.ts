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
import { checkAdmin } from "../middleware/role";

const router = Router();

// Get questions with filters (topic_slug required, optional: seq_no, tags, index, limit)
router.get("/", optionalAuth, getQuestions);

// Get bookmarked question (requires auth)
router.get("/bookmarked", authenticate, getBookmarkedQuestion);

// Get question by slug (uses optionalAuth for premium check)
router.get("/slug/:slug", optionalAuth, getQuestionBySlug);

// only admin can create, update, delete questions
router.use(checkAdmin);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
