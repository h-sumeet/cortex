import type { Request, Response, NextFunction } from "express";
import { CUSTOM_HEADERS } from "../constants/common";
import { ERRORS_MSG } from "../constants/error";
import { throwError } from "../utils/response";
import { CREDLOCK_API } from "../constants/api";
import type { CredlockResponse } from "../types/profile";
import { config } from "../config/app";

export const checkAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    const refreshToken = req.headers[CUSTOM_HEADERS.REFRESH_TOKEN] as string;
    const service = req.headers[CUSTOM_HEADERS.SERVICE_HEADER] as string;

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
        [CUSTOM_HEADERS.REFRESH_TOKEN]: refreshToken,
        [CUSTOM_HEADERS.SERVICE_HEADER]: service,
      },
    });

    const data = (await response.json()) as CredlockResponse;
    if (data.status === "error") {
      throwError(data.msg || ERRORS_MSG.AUTH_FAILED, response.status);
    }

    if (data.data.user.email !== config.adminEmail) {
      throwError(ERRORS_MSG.UNAUTHORIZED, 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};
