import type { Request, Response } from "express";
import {
  deleteUser,
  listUsers,
  updateUserStatus,
  listAdminOrders,
  listAdminProducts,
  listAdminCategories,
  getDashboardStats
} from "../services/adminService";
import { createCategory, deleteCategory, updateCategory } from "../services/categoryService";
import { createBrand, deleteBrand, listAdminBrands, updateBrand } from "../services/brandService";
import { uploadProductImage } from "../services/objectStorageService";
import { updateOrderStatus } from "../services/orderService";
import { createProduct, deleteProduct, updateProduct } from "../services/productService";
import { successResponse } from "../utils/response";

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const payload = { ...req.body };
  if (req.file) {
    payload.image = await uploadProductImage(req.file, payload.slug || payload.title);
  }

  const data = await createProduct(payload);
  res.status(201).json(successResponse("Done", data));
};

export const adminPatchProduct = async (req: Request, res: Response): Promise<void> => {
  const payload = { ...req.body };

  if (req.file) {
    payload.image = await uploadProductImage(req.file, payload.slug || payload.title);
  }

  const data = await updateProduct(String(req.params.id), payload);
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

export const adminGetOrders = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;

  const data = await listAdminOrders({ search, status, page, limit });
  res.json(successResponse("Done", data));
};

export const adminPatchOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await updateOrderStatus(String(req.params.id), req.body.status);
  res.json(successResponse("Done", data));
};

export const adminGetUsers = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;

  const data = await listUsers({ search, page, limit });
  res.json(successResponse("Done", data));
};

export const adminPatchUserStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await updateUserStatus(String(req.params.id), req.body.isActive);
  res.json(successResponse("Done", data));
};

export const adminDeleteUser = async (req: Request, res: Response): Promise<void> => {
  await deleteUser(String(req.params.id));
  res.json(successResponse("Done", {}));
};

export const adminGetProducts = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;

  const data = await listAdminProducts({ search, page, limit });
  res.json(successResponse("Done", data));
};

export const adminGetCategories = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;

  const data = await listAdminCategories({ search, page, limit });
  res.json(successResponse("Done", data));
};

export const adminGetBrands = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;

  const data = await listAdminBrands({ search, page, limit });
  res.json(successResponse("Done", data));
};

export const adminCreateBrand = async (req: Request, res: Response): Promise<void> => {
  const data = await createBrand(req.body);
  res.status(201).json(successResponse("Done", data));
};

export const adminPatchBrand = async (req: Request, res: Response): Promise<void> => {
  const data = await updateBrand(String(req.params.id), req.body);
  res.json(successResponse("Done", data));
};

export const adminDeleteBrand = async (req: Request, res: Response): Promise<void> => {
  await deleteBrand(String(req.params.id));
  res.json(successResponse("Done", {}));
};

export const adminGetStats = async (_req: Request, res: Response): Promise<void> => {
  const data = await getDashboardStats();
  res.json(successResponse("Done", data));
};
