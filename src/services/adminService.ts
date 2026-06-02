import { UserModel } from "../models/User";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
import { CategoryModel } from "../models/Category";
import { AppError } from "../utils/errors";
import { withSignedProductImages } from "../utils/productImages";

export const listUsers = async (query: { search?: string; page: number; limit: number }) => {
  const filter: Record<string, any> = {};
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.$or = [{ name: term }, { email: term }, { phone: term }];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    UserModel.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    UserModel.countDocuments(filter),
  ]);
  return { 
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await UserModel.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const listAdminOrders = async (query: { search?: string; status?: string; page: number; limit: number }) => {
  const filter: Record<string, any> = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.$or = [
      { orderNumber: term },
      { "address.fullName": term },
      { "address.phone": term },
    ];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    OrderModel.countDocuments(filter),
  ]);
  return withSignedProductImages({
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  });
};

export const listAdminProducts = async (query: { search?: string; page: number; limit: number }) => {
  const filter: Record<string, any> = {};
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.$or = [{ title: term }, { brand: term }, { usedFor: term }];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    ProductModel.countDocuments(filter),
  ]);
  return withSignedProductImages({
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  });
};

export const listAdminCategories = async (query: { search?: string; page: number; limit: number }) => {
  const filter: Record<string, any> = {};
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.name = term;
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    CategoryModel.find(filter).sort({ level: 1, order: 1, name: 1 }).skip(skip).limit(query.limit).lean(),
    CategoryModel.countDocuments(filter),
  ]);
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
};

export const getDashboardStats = async () => {
  const [totalProducts, totalOrders, pendingOrders, completedOrders, totalUsers, lowStockProducts] = await Promise.all([
    ProductModel.countDocuments(),
    OrderModel.countDocuments(),
    OrderModel.countDocuments({ status: "pending" }),
    OrderModel.countDocuments({ status: "completed" }),
    UserModel.countDocuments({ role: "user" }),
    ProductModel.countDocuments({ stock: { $lt: 20 } }),
  ]);
  return [
    { label: "Total products", value: totalProducts },
    { label: "Total orders", value: totalOrders },
    { label: "Pending orders", value: pendingOrders },
    { label: "Completed orders", value: completedOrders },
    { label: "Total users", value: totalUsers },
    { label: "Low stock products", value: lowStockProducts },
  ];
};
