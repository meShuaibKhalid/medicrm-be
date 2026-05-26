import { WishlistModel } from "../models/Wishlist";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/errors";
import { addCartItem } from "./cartService";

export const getOrCreateWishlist = async (userId: string): Promise<any> => {
  const wishlist = await WishlistModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true },
  ).populate("items.productId");
  
  return wishlist;
};

export const addWishlistItem = async (userId: string, productId: string) => {
  const product = await ProductModel.findById(productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);

  const wishlist = await WishlistModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true },
  );

  const exists = wishlist.items.some((item: any) => String(item.productId?._id || item.productId) === productId);
  if (!exists) {
    wishlist.items.push({ productId: product._id } as any);
    await wishlist.save();
  }

  return wishlist.populate("items.productId");
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  const wishlist = await WishlistModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true },
  );

  wishlist.items = wishlist.items.filter((item: any) => String(item.productId?._id || item.productId) !== productId) as any;
  await wishlist.save();

  return wishlist.populate("items.productId");
};

export const moveWishlistItemToCart = async (userId: string, productId: string) => {
  const wishlist = await WishlistModel.findOne({ userId });
  if (!wishlist) throw new AppError("Wishlist not found", 404);

  const itemIndex = wishlist.items.findIndex((item: any) => String(item.productId?._id || item.productId) === productId);
  if (itemIndex === -1) throw new AppError("Product not found in wishlist", 404);

  // Add to cart
  await addCartItem(userId, productId, 1);

  // Remove from wishlist
  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return wishlist.populate("items.productId");
};
