import type { Request, Response } from "express";
import { UserModel } from "../models/User";
import { loginUser, registerUser } from "../services/authService";
import { successResponse } from "../utils/response";

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = await registerUser(req.body);
  res.status(201).json(successResponse("Done", data));
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = await loginUser(req.body);
  res.json(successResponse("Done", data));
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = await UserModel.findById(req.user?.id).select("-passwordHash").lean();
  res.json(successResponse("Done", user));
};
