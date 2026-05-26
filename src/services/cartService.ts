import { CartModel } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/errors";
import { computeDiscountAmount } from "../utils/pricing";

const round2 = (value: number): number => Number(value.toFixed(2));
type CartItemInput = {
  productId: string;
  quantity: number;
  price: number;
  salePrice: number;
  discountAmount: number;
  lineTotal: number;
};

export const getOrCreateCart = async (userId: string): Promise<any> => {
  const cart = await CartModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [], subtotal: 0, discountTotal: 0, grandTotal: 0 } },
    { new: true, upsert: true },
  );

  return recalculateCartDocument(cart);
};

export const addCartItem = async (userId: string, productId: string, quantity: number) => {
  const cart = await getOrCreateCart(userId);
  const product = await ProductModel.findById(productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  const stock = Number(product.stock);
  const maxOrder = Number(product.maxOrder);
  const price = Number(product.price);
  const salePrice = Number(product.salePrice);
  if (stock <= 0) throw new AppError("Product is out of stock", 400);
  if (quantity > stock) throw new AppError("Quantity exceeds stock", 400);
  if (maxOrder > 0 && quantity > maxOrder) throw new AppError("Quantity exceeds max order", 400);

  const existingItem = cart.items.find((item: any) => String(item.productId?._id || item.productId) === productId);
  const nextQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  if (nextQuantity > stock) throw new AppError("Quantity exceeds stock", 400);
  if (maxOrder > 0 && nextQuantity > maxOrder) throw new AppError("Quantity exceeds max order", 400);

  const discountAmount = computeDiscountAmount(price, salePrice);
  const nextItem = {
    productId: String(product._id),
    quantity: nextQuantity,
    price,
    salePrice,
    discountAmount,
    lineTotal: round2(salePrice * nextQuantity),
  };

  cart.set("items", [...cart.items.filter((item: any) => String(item.productId?._id || item.productId) !== productId), nextItem] as CartItemInput[]);
  return recalculateCartDocument(cart);
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
  const cart = await getOrCreateCart(userId);
  const product = await ProductModel.findById(productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  const stock = Number(product.stock);
  const maxOrder = Number(product.maxOrder);
  const price = Number(product.price);
  const salePrice = Number(product.salePrice);
  if (quantity > stock) throw new AppError("Quantity exceeds stock", 400);
  if (maxOrder > 0 && quantity > maxOrder) throw new AppError("Quantity exceeds max order", 400);

  const item = cart.items.find((entry: any) => String(entry.productId?._id || entry.productId) === productId);
  if (!item) throw new AppError("Cart item not found", 404);

  item.quantity = quantity;
  item.price = price;
  item.salePrice = salePrice;
  item.discountAmount = computeDiscountAmount(price, salePrice);
  item.lineTotal = round2(salePrice * quantity);

  return recalculateCartDocument(cart);
};

export const removeCartItem = async (userId: string, productId: string) => {
  const cart = await getOrCreateCart(userId);
  cart.set("items", cart.items.filter((item: any) => String(item.productId?._id || item.productId) !== productId) as CartItemInput[]);
  return recalculateCartDocument(cart);
};

export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  cart.set("items", [] as CartItemInput[]);
  return recalculateCartDocument(cart);
};

export const recalculateCartDocument = async (cart: any): Promise<any> => {
  const productIds = cart.items.map((item: any) => item.productId?._id || item.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const normalizedItems = cart.items
    .map((item: any) => {
      const product = productMap.get(String(item.productId?._id || item.productId));
      if (!product || !product.isActive || Number(product.stock) <= 0) return null;
      const stock = Number(product.stock);
      const maxOrder = Number(product.maxOrder);
      const price = Number(product.price);
      const salePrice = Number(product.salePrice);

      const quantity = Math.min(
        item.quantity,
        stock,
        maxOrder > 0 ? maxOrder : item.quantity,
      );

      const discountAmount = computeDiscountAmount(price, salePrice);

      return {
        productId: String(product._id),
        quantity,
        price,
        salePrice,
        discountAmount,
        lineTotal: round2(salePrice * quantity),
      };
    })
    .filter((item: CartItemInput | null): item is CartItemInput => Boolean(item));

  cart.set("items", normalizedItems as CartItemInput[]);
  cart.subtotal = round2(cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0));
  cart.discountTotal = round2(cart.items.reduce((sum: number, item: any) => sum + item.discountAmount * item.quantity, 0));
  cart.grandTotal = round2(cart.items.reduce((sum: number, item: any) => sum + item.lineTotal, 0));
  await cart.save();
  await cart.populate("items.productId");

  return cart;
};
