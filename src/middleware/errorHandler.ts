import type { Request, Response, NextFunction } from "express";

// Prisma error handler
const handlePrismaError = (error: any): { code: number; message: string } => {
  // P2025: Record not found
  if (error.code === "P2025") {
    return {
      code: 404,
      message: "Record not found",
    };
  }

  // P2002: Unique constraint violation
  if (error.code === "P2002") {
    return {
      code: 409,
      message: "A record with this value already exists",
    };
  }

  // P2003: Foreign key constraint violation
  if (error.code === "P2003") {
    return {
      code: 400,
      message: "Invalid reference to related record",
    };
  }

  // P2014: Invalid ID
  if (error.code === "P2014") {
    return {
      code: 400,
      message: "Invalid ID format",
    };
  }

  // Default Prisma error
  return {
    code: 400,
    message: error.message || "Database operation failed",
  };
};

// global error handler
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  // Handle Prisma errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    const { code, message } = handlePrismaError(err);
    res.status(code).json({
      code,
      status: "error",
      msg: message,
    });
    return;
  }

  // Handle custom operational errors
  const statusCode = typeof err.code === "number" ? err.code : 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    code: statusCode,
    status: "error",
    msg: message,
  });
};

// 404 route Not Found handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  res.status(404).send({
    code: 404,
    status: "error",
    msg: "Resource not found",
  });
};
