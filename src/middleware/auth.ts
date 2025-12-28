import type { Request, Response, NextFunction } from "express";
import { throwError } from "../utils/response";
import type { AuthenticatedUser, CredlockResponse } from "../types/profile";
import { CREDLOCK_API } from "../constants/api";
import { ERRORS_MSG } from "../constants/error";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authenticate user via CREDLOCK service
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;
    const refreshToken = req.headers["x-refresh-token"] as string;
    const service = req.headers["x-service"] as string;

    // Validate required headers
    if (!authorization) {
      throwError(ERRORS_MSG.AUTH_HEADER_REQUIRED, 401);
    }

    if (!refreshToken) {
      throwError(ERRORS_MSG.REFRESH_TOKEN_REQUIRED, 401);
    }

    if (!service) {
      throwError(ERRORS_MSG.SERVICE_REQUIRED, 401);
    }

    // Call CREDLOCK service to validate user
    const response = await fetch(CREDLOCK_API.profile.getUser, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-refresh-token": refreshToken,
        "x-service": service,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        msg?: string;
      };
      throwError(errorData.msg || ERRORS_MSG.AUTH_FAILED, response.status);
    }

    const data = (await response.json()) as CredlockResponse;

    // Check if user is active
    if (!data.data.user.isActive) {
      throwError(ERRORS_MSG.USER_INACTIVE, 403);
    }

    // Attach user to request
    req.user = {
      id: data.data.user.id,
      fullname: data.data.user.fullname,
      email: data.data.user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return next();
    }

    await authenticate(req, res, next);
  } catch {
    // Silently continue without user
    next();
  }
};
