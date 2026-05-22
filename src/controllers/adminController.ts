import type { Request, Response } from "express";
import { listUsers, updateUserStatus } from "../services/adminService";
import { createCategory, deleteCategory, updateCategory } from "../services/categoryService";
import { listOrders, updateOrderStatus } from "../services/orderService";
import { createProduct, deleteProduct, updateProduct } from "../services/productService";
import { successResponse } from "../utils/response";

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const data = await createProduct(req.body);
  res.status(201).json(successResponse("Done", data));
};

export const adminPatchProduct = async (req: Request, res: Response): Promise<void> => {
  const data = await updateProduct(String(req.params.id), req.body);
  res.json(successResponse("Done", data));
};

export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  await deleteProduct(String(req.params.id));
  res.json(successResponse("Done", {}));
};

export const adminCreateCategory = async (req: Request, res: Response): Promise<void> => {
  const data = await createCategory(req.body);
  res.status(201).json(successResponse("Done", data));
};

export const adminPatchCategory = async (req: Request, res: Response): Promise<void> => {
  const data = await updateCategory(String(req.params.id), req.body);
  res.json(successResponse("Done", data));
};

export const adminDeleteCategory = async (req: Request, res: Response): Promise<void> => {
  await deleteCategory(String(req.params.id));
  res.json(successResponse("Done", {}));
};

export const adminGetOrders = async (_req: Request, res: Response): Promise<void> => {
  const data = await listOrders();
  res.json(successResponse("Done", data));
};

export const adminPatchOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await updateOrderStatus(String(req.params.id), req.body.status);
  res.json(successResponse("Done", data));
};

export const adminGetUsers = async (_req: Request, res: Response): Promise<void> => {
  const data = await listUsers();
  res.json(successResponse("Done", data));
};

export const adminPatchUserStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await updateUserStatus(String(req.params.id), req.body.isActive);
  res.json(successResponse("Done", data));
};
