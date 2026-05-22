import { UserModel } from "../models/User";
import { AppError } from "../utils/errors";

export const listUsers = async () =>
  UserModel.find().select("-passwordHash").sort({ createdAt: -1 }).lean();

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await UserModel.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
};
