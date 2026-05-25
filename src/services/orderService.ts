import mongoose from "mongoose";
import { AddressModel } from "../models/Address";
import { CartModel } from "../models/Cart";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/errors";
import { recalculateCartDocument } from "./cartService";

const DELIVERY_FEE = 0;

export const createOrder = async (userId: string, addressId: string, customerNote: string, prescriptionUrl?: string) => {
  const address = await AddressModel.findOne({ _id: addressId, userId }).lean();
  if (!address) throw new AppError("Address not found", 404);
  if (!address.latitude || !address.longitude) throw new AppError("Address missing location coordinates", 400);

  const session = await mongoose.startSession();
  let createdOrderId: mongoose.Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      const cart = await CartModel.findOne({ userId }).session(session);
      if (!cart) throw new AppError("Cart is empty", 400);

      await recalculateCartDocument(cart);
      if (cart.items.length === 0) throw new AppError("Cart is empty", 400);

      const productIds = cart.items.map((item) => item.productId);
      const products = await ProductModel.find({ _id: { $in: productIds } }).session(session);
      const productMap = new Map(products.map((product) => [String(product._id), product]));

      for (const item of cart.items) {
        const product = productMap.get(String(item.productId));
        if (!product || !product.isActive) throw new AppError("Product not available", 400);
        if (Number(product.stock) < item.quantity) throw new AppError("Insufficient stock", 400);
        if (product.prescriptionRequired && !prescriptionUrl) {
          throw new AppError(`Prescription required for ${product.title}`, 400);
        }
      }

      const order = await OrderModel.create(
        [
          {
            orderNumber: `ORD-${Date.now()}`,
            userId,
            addressId,
            items: cart.items.map((item) => {
              const product = productMap.get(String(item.productId));
              return {
                productId: item.productId,
                title: product?.title ?? "Product",
                quantity: item.quantity,
                price: item.price,
                salePrice: item.salePrice,
                lineTotal: item.lineTotal,
              };
            }),
            subtotal: cart.subtotal,
            discountTotal: cart.discountTotal,
            deliveryFee: DELIVERY_FEE,
            grandTotal: cart.grandTotal + DELIVERY_FEE,
            customerNote,
            prescriptionUrl: prescriptionUrl || "",
          },
        ],
        { session },
      );

      createdOrderId = order[0]._id;

      for (const item of cart.items) {
        await ProductModel.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } },
          { session },
        );
      }

      cart.set("items", []);
      cart.subtotal = 0;
      cart.discountTotal = 0;
      cart.grandTotal = 0;
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrderId) throw new AppError("Unable to create order", 500);
  return OrderModel.findById(createdOrderId).lean();
};

export const listMyOrders = async (userId: string) =>
  OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();

export const getMyOrder = async (userId: string, orderId: string) => {
  const order = await OrderModel.findOne({ _id: orderId, userId }).lean();
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

export const listOrders = async () => OrderModel.find().sort({ createdAt: -1 }).lean();

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};
