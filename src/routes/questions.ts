import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionBySlug,
  updateQuestion,
  deleteQuestion,
} from "../controllers/QuestionController";

const router = Router();

// Create question
router.post("/", createQuestion);

// Get questions with filters (topic_slug required, optional: seq_no, tags, limit)
router.get("/", getQuestions);

// Get question by slug
router.get("/slug/:slug", getQuestionBySlug);

// Update question
router.put("/:id", updateQuestion);

// Delete question
router.delete("/:id", deleteQuestion);

export default router;
