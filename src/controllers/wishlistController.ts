import type { Request, Response } from "express";
import { addWishlistItem, getOrCreateWishlist, moveWishlistItemToCart, removeWishlistItem } from "../services/wishlistService";
import { successResponse } from "../utils/response";

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const data = await getOrCreateWishlist(req.user!.id);
  res.json(successResponse("Done", data));
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const data = await addWishlistItem(req.user!.id, req.body.productId);
  res.status(201).json(successResponse("Done", data));
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const data = await removeWishlistItem(req.user!.id, String(req.params.productId));
  res.json(successResponse("Done", data));
};

export const moveToCart = async (req: Request, res: Response): Promise<void> => {
  const data = await moveWishlistItemToCart(req.user!.id, String(req.params.productId));
  res.json(successResponse("Done", data));
};
