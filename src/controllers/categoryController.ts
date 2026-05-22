import type { Request, Response } from "express";
import { getCategoryBySlug, getCategoryTree, listCategories } from "../services/categoryService";
import { listProducts } from "../services/productService";
import { successResponse } from "../utils/response";

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const data = await listCategories();
  res.json(successResponse("Done", data));
};

export const getCategoriesTree = async (_req: Request, res: Response): Promise<void> => {
  const data = await getCategoryTree();
  res.json(successResponse("Done", data));
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const data = await getCategoryBySlug(String(req.params.slug));
  res.json(successResponse("Done", data));
};

export const getCategoryProducts = async (req: Request, res: Response): Promise<void> => {
  const data = await listProducts({
    page: 1,
    limit: 20,
    sort: "latest",
    categorySlug: String(req.params.slug),
    includeDescendants: true,
  });
  res.json(successResponse("Done", data));
};
