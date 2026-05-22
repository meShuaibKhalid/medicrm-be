import type { Request, Response } from "express";
import { createOrder, getMyOrder, listMyOrders } from "../services/orderService";
import { successResponse } from "../utils/response";

export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const data = await createOrder(req.user!.id, req.body.addressId, req.body.customerNote ?? "");
  res.status(201).json(successResponse("Done", data));
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const data = await listMyOrders(req.user!.id);
  res.json(successResponse("Done", data));
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const data = await getMyOrder(req.user!.id, String(req.params.id));
  res.json(successResponse("Done", data));
};
