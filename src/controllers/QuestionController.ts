import type { Request, Response, NextFunction } from "express";
import * as QuestionService from "../services/QuestionService";
import * as TopicService from "../services/TopicService";
import { sendSuccess, throwError } from "../utils/response";
import { generateSlug, generateQuestionSlug } from "../utils/slug";
import { QUESTION_DEFAULTS } from "../constants/question";

/**
 * Create a new question
 */
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      seq_no,
      topic,
      question,
      answer,
      options,
      explanation,
      image_url,
      difficulty,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !topic ||
      !question ||
      answer === undefined ||
      !options ||
      !difficulty
    ) {
      throwError(
        "topic, question, answer, options, and difficulty are required",
        400
      );
    }

    // Get topic by slug
    const topic_slug = generateSlug(topic);
    const topicData = await TopicService.getTopicBySlug(topic_slug);

    if (!topicData) {
      throwError("Topic not found", 404);
    }

    // If seq_no not provided, get the next sequence number
    let sequence_no = seq_no;
    if (!sequence_no) {
      const lastSeqNo = await QuestionService.getLastSeqNo(topicData.id);
      sequence_no = lastSeqNo + 1;
    }

    // Generate unique question slug (first 8 words + hash)
    const qn_slug = generateQuestionSlug(question);

    const newQuestion = await QuestionService.createQuestion({
      seq_no: sequence_no,
      topic_id: topicData!.id,
      qn_slug,
      question,
      answer,
      options,
      explanation,
      image_url,
      difficulty,
      tags: tags || [],
    });

    // Increment topic's question count
    await TopicService.incrementQuestionCount(topicData!.id);

    sendSuccess(res, "Question created successfully", newQuestion, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get question by slug
 */
export const getQuestionBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throwError("Question slug is required", 400);
    }

    const question = await QuestionService.getQuestionBySlug(slug);

    if (!question) {
      throwError("Question not found", 404);
    }

    sendSuccess(res, "Question fetched successfully", question);
  } catch (error) {
    next(error);
  }
};

/**
 * Get questions with filters
 * Supports: topic_slug, seq_no, tags, limit
 */
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topic_slug, seq_no, tags, limit } = req.query;

    // Validate required topic_slug
    if (!topic_slug || typeof topic_slug !== "string") {
      throwError("topic_slug is required", 400);
    }

    // Parse limit with default
    const questionLimit = limit
      ? Math.min(parseInt(limit as string, 10), QUESTION_DEFAULTS.MAX_LIMIT)
      : QUESTION_DEFAULTS.FETCH_LIMIT;

    // Scenario 1: Get question by topic and index (1-based)
    if (seq_no) {
      const index = parseInt(seq_no as string, 10);

      if (index < 1) {
        throwError("Index must be a positive integer starting from 1", 400);
      }

      const question = await QuestionService.getQuestionByTopicAndIndex(
        topic_slug,
        index
      );

      if (!question) {
        throwError("Question not found at the specified index", 404);
      }

      sendSuccess(res, "Question fetched successfully", question);
      return;
    }

    // Scenario 2: Get questions by topic and tags
    if (tags) {
      const tagArray =
        typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
      const questions = await QuestionService.getQuestionsByTopicAndTags(
        topic_slug,
        tagArray,
        questionLimit
      );

      if (!questions) {
        throwError("Topic not found", 404);
      }

      sendSuccess(res, "Questions fetched successfully", {
        questions,
        count: questions.length,
        limit: questionLimit,
      });
      return;
    }

    // Scenario 3: Get questions by topic only
    const questions = await QuestionService.getQuestionsByTopicSlug(
      topic_slug,
      questionLimit
    );

    if (!questions) {
      throwError("Topic not found", 404);
    }

    sendSuccess(res, "Questions fetched successfully", {
      questions,
      count: questions.length,
      limit: questionLimit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a question
 */
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      seq_no,
      topic,
      question,
      answer,
      options,
      explanation,
      image_url,
      difficulty,
      tags,
    } = req.body;

    if (!id) {
      throwError("Question ID is required", 400);
    }

    const updateData: any = {};

    if (seq_no !== undefined) updateData.seq_no = seq_no;
    if (answer !== undefined) updateData.answer = answer;
    if (options) updateData.options = options;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (difficulty) updateData.difficulty = difficulty;
    if (tags) updateData.tags = tags;

    // Handle topic change
    if (topic) {
      const topic_slug = generateSlug(topic);
      const topicData = await TopicService.getTopicBySlug(topic_slug);

      if (!topicData) {
        throwError("Topic not found", 404);
      }

      updateData.topic_id = topicData.id;
    }

    // Handle question text change (regenerate slug)
    if (question) {
      updateData.question = question;
      updateData.qn_slug = generateQuestionSlug(question);
    }

    const updatedQuestion = await QuestionService.updateQuestion(
      id,
      updateData
    );

    sendSuccess(res, "Question updated successfully", updatedQuestion);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throwError("Question ID is required", 400);
    }

    // Get question to find topic_id
    const question = await QuestionService.getQuestionBySlug(id);
    if (!question) {
      throwError("Question not found", 404);
    }

    await QuestionService.deleteQuestion(id);

    // Decrement topic's question count
    await TopicService.decrementQuestionCount(question!.topic_id);

    sendSuccess(res, "Question deleted successfully", null, 204);
  } catch (error) {
    next(error);
  }
};
