import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/errors";

export const registerUser = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    passwordHash,
  });

  return buildAuthResponse(user);
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
  if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);

  const matches = await bcrypt.compare(payload.password, user.passwordHash);
  if (!matches) throw new AppError("Invalid credentials", 401);

  return buildAuthResponse(user);
};

const buildAuthResponse = (user: { _id: unknown; name: string; email: string; phone: string; role: "user" | "admin"; isActive: boolean }) => {
  const token = jwt.sign({ userId: String(user._id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    },
  };
};
