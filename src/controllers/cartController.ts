import type { Request, Response } from "express";
import { addCartItem, clearCart, getOrCreateCart, removeCartItem, updateCartItem } from "../services/cartService";
import { successResponse } from "../utils/response";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const data = await getOrCreateCart(req.user!.id);
  res.json(successResponse("Done", data));
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const data = await addCartItem(req.user!.id, req.body.productId, req.body.quantity);
  res.status(201).json(successResponse("Done", data));
};

export const patchItem = async (req: Request, res: Response): Promise<void> => {
  const data = await updateCartItem(req.user!.id, String(req.params.productId), req.body.quantity);
  res.json(successResponse("Done", data));
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  const data = await removeCartItem(req.user!.id, String(req.params.productId));
  res.json(successResponse("Done", data));
};

export const destroyCart = async (req: Request, res: Response): Promise<void> => {
  const data = await clearCart(req.user!.id);
  res.json(successResponse("Done", data));
};
