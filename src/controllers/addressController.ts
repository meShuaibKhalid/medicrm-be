import type { Request, Response } from "express";
import { AddressModel } from "../models/Address";
import { successResponse } from "../utils/response";
import { AppError } from "../utils/errors";

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const addressData = { ...req.body, userId };

  if (addressData.isDefault) {
    await AddressModel.updateMany({ userId }, { isDefault: false });
  }

  const address = await AddressModel.create(addressData);
  res.status(201).json(successResponse("Address created", address));
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  res.json(successResponse("Addresses fetched", addresses));
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  if (req.body.isDefault) {
    await AddressModel.updateMany({ userId }, { isDefault: false });
  }

  const address = await AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    req.body,
    { new: true }
  );

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  res.json(successResponse("Address updated", address));
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  const address = await AddressModel.findOneAndDelete({ _id: addressId, userId });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  res.json(successResponse("Address deleted", null));
};

export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const addressId = req.params.id;

  await AddressModel.updateMany({ userId }, { isDefault: false });

  const address = await AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    { isDefault: true },
    { new: true }
  );

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  res.json(successResponse("Default address set", address));
};
