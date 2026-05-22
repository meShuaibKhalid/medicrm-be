import type { Request, Response } from "express";
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress } from "../services/addressService";
import { successResponse } from "../utils/response";

export const getMyAddresses = async (req: Request, res: Response): Promise<void> => {
  const data = await listAddresses(req.user!.id);
  res.json(successResponse("Done", data));
};

export const addMyAddress = async (req: Request, res: Response): Promise<void> => {
  const data = await createAddress(req.user!.id, req.body);
  res.status(201).json(successResponse("Done", data));
};

export const patchMyAddress = async (req: Request, res: Response): Promise<void> => {
  const data = await updateAddress(req.user!.id, String(req.params.id), req.body);
  res.json(successResponse("Done", data));
};

export const removeMyAddress = async (req: Request, res: Response): Promise<void> => {
  await deleteAddress(req.user!.id, String(req.params.id));
  res.json(successResponse("Done", {}));
};

export const makeDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  const data = await setDefaultAddress(req.user!.id, String(req.params.id));
  res.json(successResponse("Done", data));
};
