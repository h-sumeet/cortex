import type { Request, Response, NextFunction } from "express";
import * as ProviderService from "../services/ProviderService";
import { sendSuccess, throwError } from "../utils/response";
import { generateSlug } from "../utils/slug";

export const createProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider } = req.body;

    if (!provider) {
      throwError("Provider name is required", 400);
    }

    const provider_slug = generateSlug(provider);

    const newProvider = await ProviderService.createProvider({
      provider,
      provider_slug,
    });

    sendSuccess(res, "Provider created successfully", newProvider, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllProviders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const providers = await ProviderService.getAllProviders();
    sendSuccess(res, "Providers fetched successfully", providers);
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throwError("Provider ID is required", 400);
    }

    const provider = await ProviderService.getProviderById(id);

    if (!provider) {
      throwError("Provider not found", 404);
    }

    sendSuccess(res, "Provider fetched successfully", provider);
  } catch (error) {
    next(error);
  }
};

export const getProviderBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throwError("Provider slug is required", 400);
    }

    const provider = await ProviderService.getProviderBySlug(slug);

    if (!provider) {
      throwError("Provider not found", 404);
    }

    sendSuccess(res, "Provider fetched successfully", provider);
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { provider } = req.body;

    if (!id) {
      throwError("Provider ID is required", 400);
    }

    const updateData: { provider?: string; provider_slug?: string } = {};
    
    if (provider) {
      updateData.provider = provider;
      updateData.provider_slug = generateSlug(provider);
    }

    const updatedProvider = await ProviderService.updateProvider(id, updateData);

    sendSuccess(res, "Provider updated successfully", updatedProvider);
  } catch (error) {
    next(error);
  }
};

export const deleteProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throwError("Provider ID is required", 400);
    }

    await ProviderService.deleteProvider(id);

    sendSuccess(res, "Provider deleted successfully", null, 204);
  } catch (error) {
    next(error);
  }
};
