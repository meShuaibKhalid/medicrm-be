import type { Request, Response } from "express";
import { getProductBySlug, listProducts } from "../services/productService";
import { successResponse } from "../utils/response";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const data = await listProducts(req.query as never);
  res.json(successResponse("Done", data));
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const data = await getProductBySlug(String(req.params.slug));
  res.json(successResponse("Done", data));
};
