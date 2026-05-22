import { AddressModel } from "../models/Address";
import { AppError } from "../utils/errors";

const ensureSingleDefault = async (userId: string, addressId?: string): Promise<void> => {
  const filter = addressId ? { userId, _id: { $ne: addressId } } : { userId };
  await AddressModel.updateMany(filter, { $set: { isDefault: false } });
};

export const listAddresses = async (userId: string) =>
  AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

export const createAddress = async (userId: string, payload: Record<string, unknown>) => {
  const hasDefault = await AddressModel.exists({ userId, isDefault: true });
  const shouldBeDefault = payload.isDefault === true || !hasDefault;

  if (shouldBeDefault) await ensureSingleDefault(userId);

  return AddressModel.create({ ...payload, userId, isDefault: shouldBeDefault });
};

export const updateAddress = async (userId: string, addressId: string, payload: Record<string, unknown>) => {
  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) throw new AppError("Address not found", 404);

  if (payload.isDefault === true) await ensureSingleDefault(userId, addressId);

  Object.assign(address, payload);
  return address.save();
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await AddressModel.findOneAndDelete({ _id: addressId, userId });
  if (!address) throw new AppError("Address not found", 404);

  if (address.isDefault) {
    const latestAddress = await AddressModel.findOne({ userId }).sort({ createdAt: -1 });
    if (latestAddress) {
      latestAddress.isDefault = true;
      await latestAddress.save();
    }
  }
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) throw new AppError("Address not found", 404);

  await ensureSingleDefault(userId, addressId);
  address.isDefault = true;
  return address.save();
};
