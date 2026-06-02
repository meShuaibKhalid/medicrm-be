import type mongoose from "mongoose";
import { CategoryModel } from "../models/Category";
import { BrandModel } from "../models/Brand";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/errors";
import { withSignedProductImages } from "../utils/productImages";
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

const getBrandIdFromQuery = async (brandId?: string, brandSlug?: string): Promise<mongoose.Types.ObjectId | undefined> => {
  if (brandId) {
    const brand = await BrandModel.findById(brandId).select("_id").lean();
    return brand?._id;
  }

  if (brandSlug) {
    const brand = await BrandModel.findOne({ slug: brandSlug, isActive: true }).select("_id").lean();
    return brand?._id;
  }

  return undefined;
};

const resolveBrandReference = async (payload: { brandId?: string | null; brand?: string; brandSlug?: string }) => {
  const incomingBrandId = payload.brandId?.trim();
  if (incomingBrandId) {
    const brand = await BrandModel.findById(incomingBrandId).lean();
    if (!brand) throw new AppError("Brand not found", 404);
    return brand;
  }

  const brandName = payload.brand?.trim() || payload.brandSlug?.trim() || "";
  if (!brandName) return null;

  const slug = toSlug(brandName);
  return BrandModel.findOneAndUpdate(
    { slug },
    { $set: { name: brandName, slug, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const listProducts = async (query: {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  brandSlug?: string;
  brandId?: string;
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
  const brandObjectId = await getBrandIdFromQuery(query.brandId, query.brandSlug);
  if (query.brandId || query.brandSlug) filter.brandId = brandObjectId ?? null;

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

  return withSignedProductImages({
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
};

export const getProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug, isActive: true }).lean();
  if (!product) throw new AppError("Product not found", 404);
  return withSignedProductImages(product);
};

export const createProduct = async (payload: {
  externalProductId?: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  brand?: string;
  brandId?: string | null;
  brandSlug?: string;
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
  const slug = toSlug(payload.slug?.trim() || payload.title);
  const brand = await resolveBrandReference(payload);

  const product = await ProductModel.create({
    ...payload,
    slug,
    brand: brand?.name ?? payload.brand?.trim() ?? "",
    brandId: brand?._id ?? null,
    brandSlug: brand?.slug ?? toSlug(payload.brandSlug?.trim() || payload.brand?.trim() || ""),
    salePercent,
    salePrice,
  });

  return withSignedProductImages(product);
};

export const updateProduct = async (productId: string, payload: Partial<{
  externalProductId: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  brand: string;
  brandId: string | null;
  brandSlug: string;
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
  const hasBrandUpdate = Boolean(payload.brandId?.trim()) || Boolean(payload.brand?.trim()) || Boolean(payload.brandSlug?.trim()) || payload.brandId === null;
  if (hasBrandUpdate) {
    const brand = await resolveBrandReference({
      brandId: payload.brandId ?? undefined,
      brand: payload.brand,
      brandSlug: payload.brandSlug,
    });
    product.brand = brand?.name ?? payload.brand?.trim() ?? "";
    product.brandId = brand?._id ?? null;
    product.brandSlug = brand?.slug ?? toSlug(payload.brandSlug?.trim() || payload.brand?.trim() || "");
  }
  if (payload.price !== undefined || payload.salePercent !== undefined || payload.salePrice !== undefined) {
    product.salePrice = computeSalePrice(Number(product.price), Number(product.salePercent), payload.salePrice ?? Number(product.salePrice));
  }

  const savedProduct = await product.save();
  return withSignedProductImages(savedProduct);
};

export const deleteProduct = async (productId: string) => {
  const product = await ProductModel.findByIdAndDelete(productId);
  if (!product) throw new AppError("Product not found", 404);
};
