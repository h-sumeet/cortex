import type { Request, Response, NextFunction } from "express";
import * as QuestionService from "../services/QuestionService";
import * as TopicService from "../services/TopicService";
import * as ProfileService from "../services/ProfileService";
import { sendSuccess, throwError } from "../utils/response";
import { generateSlug, generateQuestionSlug } from "../utils/slug";
import { QUESTION_DEFAULTS } from "../constants/question";

/**
 * Create a new question
 * If seq_no is provided and exists, shifts other questions
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
      status,
    } = req.body;

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

    const topic_slug = generateSlug(topic);
    const topicData = await TopicService.getTopicBySlug(topic_slug);

    if (!topicData) {
      throwError("Topic not found", 404);
    }

    // Get sequence number
    let sequence_no: number;
    if (seq_no !== undefined) {
      sequence_no = typeof seq_no === "string" ? parseInt(seq_no, 10) : seq_no;
      if (isNaN(sequence_no) || sequence_no < 1) {
        throwError("seq_no must be a positive integer", 400);
      }
    } else {
      const lastSeqNo = await QuestionService.getLastSeqNo(topicData.id);
      sequence_no = lastSeqNo + 1;
    }

    const qn_slug = generateQuestionSlug(question);

    const newQuestion = await QuestionService.createQuestion({
      seq_no: sequence_no,
      topic_id: topicData.id,
      qn_slug,
      question,
      answer,
      options,
      explanation,
      image_url,
      difficulty,
      tags: tags || [],
      status: status || "published",
    });

    await TopicService.incrementQuestionCount(topicData.id);

    sendSuccess(res, "Question created successfully", newQuestion, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get question by slug
 * Checks premium access if question's seq_no exceeds topic's free_limit
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

    const questionsArray = Array.isArray(question) ? question : [question];
    const filteredQuestion = await QuestionService.filterPremiumQuestions(
      questionsArray,
      req.user?.id
    );

    sendSuccess(res, "Question fetched successfully", filteredQuestion);
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
    const { topic_slug, index, tags, limit } = req.query;

    if (!topic_slug || typeof topic_slug !== "string") {
      throwError("topic_slug is required", 400);
    }

    const indexNumber = parseInt(index as string, 10);
    if (isNaN(indexNumber) || indexNumber < 1) {
      throwError("index is required and must be a valid number", 400);
    }

    const questionLimit = limit
      ? Math.min(parseInt(limit as string, 10), QUESTION_DEFAULTS.MAX_LIMIT)
      : QUESTION_DEFAULTS.FETCH_LIMIT;

    const tagArray =
      tags && typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : undefined;

    // Get questions by topic and tags
    if (tagArray) {
      const result = await QuestionService.getQuestionsByTags(
        topic_slug,
        indexNumber,
        tagArray,
        questionLimit
      );

      if (!result || result.questions.length === 0) {
        throwError("No questions found", 404);
      }

      const filteredQuestions = await QuestionService.filterPremiumQuestions(
        result.questions,
        req.user?.id
      );

      // Handle union type Question | Question[]
      const questionsArray = Array.isArray(filteredQuestions)
        ? filteredQuestions
        : [filteredQuestions];

      sendSuccess(res, "Questions fetched successfully", {
        questions: questionsArray,
        count: questionsArray.length,
        total_count: result.totalCount,
        limit: questionLimit,
      });
      return;
    }

    // Get questions by topic only
    const result = await QuestionService.getQuestionByIndex(
      topic_slug,
      indexNumber
    );

    if (!result || result.questions.length === 0) {
      throwError("No questions found", 404);
    }

    const filteredQuestions = await QuestionService.filterPremiumQuestions(
      result.questions,
      req.user?.id
    );

    sendSuccess(res, "Questions fetched successfully", {
      questions: filteredQuestions,
      total_count: result.totalCount,
      limit: questionLimit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookmarked question by seq_no
 * Requires authentication and premium access
 * Query: topic_slug, seq_no
 */
export const getBookmarkedQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic_slug, index } = req.query;
    console.log("Received query params:", req.query);

    if (!topic_slug || typeof topic_slug !== "string") {
      throwError("topic_slug is required", 400);
    }

    const indexNumber = parseInt(index as string, 10);
    if (isNaN(indexNumber) || indexNumber < 1) {
      throwError("index must be a valid number", 400);
    }

    // Get user's bookmarked seq_nos for the topic
    const bookmarkedSeqNos = await ProfileService.getTopicBookmarks(
      userId,
      topic_slug
    );

    if (bookmarkedSeqNos.length === 0) {
      throwError("No bookmarks found for this topic", 404);
    }

    const result = await QuestionService.getBookmarkedQuestions(
      topic_slug,
      indexNumber,
      bookmarkedSeqNos
    );

    if (!result || !result.questions) {
      throwError(
        "Bookmarked question not found with the specified seq_no",
        404
      );
    }

    const filteredQuestions = await QuestionService.filterPremiumQuestions(
      result.questions,
      req.user?.id
    );

    sendSuccess(res, "Bookmarked question fetched successfully", {
      questions: filteredQuestions,
      total_bookmarked: result.totalCount,
      bookmarked_seq_nos: bookmarkedSeqNos,
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
      status,
    } = req.body;

    if (!id) {
      throwError("Question ID is required", 400);
    }

    const updateData: any = {};

    if (seq_no !== undefined) {
      const seqNoNumber =
        typeof seq_no === "string" ? parseInt(seq_no, 10) : seq_no;
      if (isNaN(seqNoNumber) || seqNoNumber < 1) {
        throwError("seq_no must be a positive integer", 400);
      }
      updateData.seq_no = seqNoNumber;
    }
    if (answer !== undefined) updateData.answer = answer;
    if (options) updateData.options = options;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (difficulty) updateData.difficulty = difficulty;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    if (topic) {
      const topic_slug = generateSlug(topic);
      const topicData = await TopicService.getTopicBySlug(topic_slug);

      if (!topicData) {
        throwError("Topic not found", 404);
      }

      updateData.topic_id = topicData.id;
    }

    if (question) {
      updateData.question = question;
      updateData.qn_slug = generateQuestionSlug(question);
    }

    const updatedQuestion = await QuestionService.updateQuestion(
      id,
      updateData
    );

    if (!updatedQuestion) {
      throwError("Question not found", 404);
    }

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

    const question = await QuestionService.getQuestionById(id);
    if (!question) {
      throwError("Question not found", 404);
    }

    await QuestionService.deleteQuestion(id);

    await TopicService.decrementQuestionCount(question.topic_id);

    sendSuccess(res, "Question deleted successfully", null, 204);
  } catch (error) {
    next(error);
  }
};
