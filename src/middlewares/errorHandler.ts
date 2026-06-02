import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { errorResponse } from "../utils/response";
import { AppError } from "../utils/errors";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(errorResponse(error.message));
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json(errorResponse(error.issues[0]?.message || "Validation error"));
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json(errorResponse(error.message));
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json(errorResponse(error.message));
    return;
  }

  if ("code" in error && error.code === 11000) {
    res.status(409).json(errorResponse("Duplicate record"));
    return;
  }

  res.status(500).json(errorResponse("Internal server error"));
};
