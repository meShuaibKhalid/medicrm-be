import type { Request, Response } from "express";
import { getBrandBySlug, getBrandProducts as getBrandProductsBySlug, listBrands } from "../services/brandService";
import { successResponse } from "../utils/response";

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  const data = await listBrands();
  res.json(successResponse("Done", data));
};

export const getBrand = async (req: Request, res: Response): Promise<void> => {
  const data = await getBrandBySlug(String(req.params.slug));
  res.json(successResponse("Done", data));
};

export const getBrandProducts = async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 20;
  const sort = req.query.sort ? String(req.query.sort) : "latest";
  const data = await getBrandProductsBySlug(String(req.params.slug), {
    page,
    limit,
    sort: sort as "price_asc" | "price_desc" | "latest" | "title_asc",
  });
  res.json(successResponse("Done", data));
};
