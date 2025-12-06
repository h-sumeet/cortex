import type { Request, Response, NextFunction } from "express";
import * as TopicService from "../services/TopicService";
import * as ProviderService from "../services/ProviderService";
import { sendSuccess, throwError } from "../utils/response";
import { generateSlug } from "../utils/slug";

export const createTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topic, provider } = req.body;

    if (!topic || !provider) {
      throwError("Topic name and provider are required", 400);
    }

    // Convert provider name to slug and find provider
    const provider_slug = generateSlug(provider);
    const providerData = await ProviderService.getProviderBySlug(provider_slug);

    if (!providerData) {
      throwError("Provider not found", 404);
    }

    const topic_slug = generateSlug(topic);

    const newTopic = await TopicService.createTopic({
      topic,
      topic_slug,
      provider_id: providerData!.id,
    });

    // Increment provider's topic count
    await ProviderService.incrementTopicCount(providerData!.id);

    sendSuccess(res, "Topic created successfully", newTopic, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topics = await TopicService.getAllTopics();
    sendSuccess(res, "Topics fetched successfully", topics);
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throwError("Topic ID is required", 400);
    }

    const topic = await TopicService.getTopicById(id);

    if (!topic) {
      throwError("Topic not found", 404);
    }

    sendSuccess(res, "Topic fetched successfully", topic);
  } catch (error) {
    next(error);
  }
};

export const getTopicBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throwError("Topic slug is required", 400);
    }

    const topic = await TopicService.getTopicBySlug(slug);

    if (!topic) {
      throwError("Topic not found", 404);
    }

    sendSuccess(res, "Topic fetched successfully", topic);
  } catch (error) {
    next(error);
  }
};

export const getTopicsByProviderId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      throwError("Provider ID is required", 400);
    }

    const topics = await TopicService.getTopicsByProviderId(providerId);

    sendSuccess(res, "Topics fetched successfully", topics);
  } catch (error) {
    next(error);
  }
};

export const getTopicsByProviderSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throwError("Provider slug is required", 400);
    }

    // Find provider by slug
    const provider = await ProviderService.getProviderBySlug(slug);

    if (!provider) {
      throwError("Provider not found", 404);
    }

    // Get all topics for this provider
    const topics = await TopicService.getTopicsByProviderId(provider!.id);

    sendSuccess(res, "Topics fetched successfully", topics);
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { topic, provider_id } = req.body;

    if (!id) {
      throwError("Topic ID is required", 400);
    }

    const updateData: {
      topic?: string;
      topic_slug?: string;
      provider_id?: string;
    } = {};

    if (topic) {
      updateData.topic = topic;
      updateData.topic_slug = generateSlug(topic);
    }

    if (provider_id) {
      updateData.provider_id = provider_id;
    }

    const updatedTopic = await TopicService.updateTopic(id, updateData);

    sendSuccess(res, "Topic updated successfully", updatedTopic);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throwError("Topic ID is required", 400);
    }

    // Get topic to find provider_id
    const topic = await TopicService.getTopicById(id);
    if (!topic) {
      throwError("Topic not found", 404);
    }

    await TopicService.deleteTopic(id);

    // Decrement provider's topic count
    await ProviderService.decrementTopicCount(topic!.provider_id);

    sendSuccess(res, "Topic deleted successfully", null, 204);
  } catch (error) {
    next(error);
  }
};
