import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "user" | "admin";
      };
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: "user" | "admin" };
  const user = await UserModel.findById(payload.userId).lean();

  if (!user || !user.isActive) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  req.user = { id: String(user._id), role: user.role };
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    next(new AppError("Forbidden", 403));
    return;
  }

  next();
};
