import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/errors";

export const validate =
  (schema: ZodTypeAny, target: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      next(new AppError(parsed.error.issues[0]?.message || "Validation error", 400));
      return;
    }

    req[target] = parsed.data;
    next();
  };
