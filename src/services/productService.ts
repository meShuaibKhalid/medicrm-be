import type mongoose from "mongoose";
import { CategoryModel } from "../models/Category";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/errors";
import { computeSalePrice } from "../utils/pricing";
import { toSlug } from "../utils/slug";

const getCategoryIdsFromQuery = async (
  categoryId?: string,
  categorySlug?: string,
  includeDescendants?: boolean,
): Promise<mongoose.Types.ObjectId[] | undefined> => {
  let baseCategory = null;

  if (categoryId) {
    baseCategory = await CategoryModel.findById(categoryId).lean();
  } else if (categorySlug) {
    baseCategory = await CategoryModel.findOne({ slug: categorySlug }).lean();
  }

  if (!baseCategory) return undefined;
  if (!includeDescendants) return [baseCategory._id];

  const descendants = await CategoryModel.find({
    $or: [{ _id: baseCategory._id }, { ancestors: baseCategory._id }],
  })
    .select("_id")
    .lean();

  return descendants.map((item) => item._id);
};

export const listProducts = async (query: {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  includeDescendants?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  prescriptionRequired?: boolean;
  page: number;
  limit: number;
  sort: "price_asc" | "price_desc" | "latest" | "title_asc";
}) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (query.search) filter.$text = { $search: query.search };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.salePrice = {};
    if (query.minPrice !== undefined) (filter.salePrice as Record<string, number>).$gte = query.minPrice;
    if (query.maxPrice !== undefined) (filter.salePrice as Record<string, number>).$lte = query.maxPrice;
  }
  if (query.inStock === true) filter.stock = { $gt: 0 };
  if (query.prescriptionRequired !== undefined) filter.prescriptionRequired = query.prescriptionRequired;

  const categoryIds = await getCategoryIdsFromQuery(query.categoryId, query.categorySlug, query.includeDescendants);
  if (categoryIds) filter.categoryIds = { $in: categoryIds };

  const sortMap = {
    price_asc: { salePrice: 1 },
    price_desc: { salePrice: -1 },
    latest: { createdAt: -1 },
    title_asc: { title: 1 },
  } as const;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).sort(sortMap[query.sort]).skip(skip).limit(query.limit).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug, isActive: true }).lean();
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

export const createProduct = async (payload: {
  externalProductId?: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  salePercent?: number;
  stock: number;
  maxOrder?: number;
  prescriptionRequired?: boolean;
  usedFor?: string;
  categoryIds: string[];
  primaryCategoryId?: string | null;
  isActive?: boolean;
}) => {
  const salePercent = payload.salePercent ?? 0;
  const salePrice = computeSalePrice(payload.price, salePercent, payload.salePrice);

  return ProductModel.create({
    ...payload,
    slug: toSlug(payload.slug),
    salePercent,
    salePrice,
  });
};

export const updateProduct = async (productId: string, payload: Partial<{
  externalProductId: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  salePrice: number;
  salePercent: number;
  stock: number;
  maxOrder: number;
  prescriptionRequired: boolean;
  usedFor: string;
  categoryIds: string[];
  primaryCategoryId: string | null;
  isActive: boolean;
}>) => {
  const product = await ProductModel.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  Object.assign(product, payload);
  if (payload.slug) product.slug = toSlug(payload.slug);
  if (payload.price !== undefined || payload.salePercent !== undefined || payload.salePrice !== undefined) {
    product.salePrice = computeSalePrice(Number(product.price), Number(product.salePercent), payload.salePrice ?? Number(product.salePrice));
  }

  return product.save();
};

export const deleteProduct = async (productId: string) => {
  const product = await ProductModel.findByIdAndDelete(productId);
  if (!product) throw new AppError("Product not found", 404);
};
