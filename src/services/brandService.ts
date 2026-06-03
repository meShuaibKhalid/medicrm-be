import { BrandModel } from "../models/Brand";
import { AppError } from "../utils/errors";
import { listProducts } from "./productService";
import { toSlug } from "../utils/slug";

export const listBrands = async () => {
  return BrandModel.find({ isActive: true }).sort({ name: 1 }).lean();
};

export const listAdminBrands = async (query: { search?: string; page: number; limit: number }) => {
  const filter: Record<string, unknown> = {};
  if (query.search) {
    const term = new RegExp(query.search, "i");
    filter.$or = [{ name: term }, { slug: term }];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    BrandModel.find(filter).sort({ name: 1 }).skip(skip).limit(query.limit).lean(),
    BrandModel.countDocuments(filter),
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

export const getBrandBySlug = async (slug: string) => {
  const brand = await BrandModel.findOne({ slug, isActive: true }).lean();
  if (!brand) throw new AppError("Brand not found", 404);
  return brand;
};

export const getBrandById = async (brandId: string) => {
  const brand = await BrandModel.findById(brandId).lean();
  if (!brand) throw new AppError("Brand not found", 404);
  return brand;
};

export const getBrandProducts = async (
  slug: string,
  query?: { page?: number; limit?: number; sort?: "price_asc" | "price_desc" | "latest" | "title_asc" },
) => {
  const brand = await getBrandBySlug(slug);
  const brandId = String(brand._id);
  return listProducts({
    page: query?.page ?? 1,
    limit: query?.limit ?? 20,
    sort: query?.sort ?? "latest",
    brandId,
    includeDescendants: true,
  });
};

export const getOrCreateBrandByName = async (name: string) => {
  const normalizedName = name.trim();
  if (!normalizedName) return null;

  const slug = toSlug(normalizedName);
  return BrandModel.findOneAndUpdate(
    { slug },
    { $set: { name: normalizedName, slug, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const createBrand = async (payload: { name: string; slug?: string; isActive?: boolean }) => {
  const name = payload.name.trim();
  if (!name) throw new AppError("Brand name is required", 400);

  const slug = toSlug(payload.slug?.trim() || name);
  const brand = await BrandModel.findOneAndUpdate(
    { slug },
    { $set: { name, slug, isActive: payload.isActive ?? true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return brand;
};

export const updateBrand = async (brandId: string, payload: Partial<{ name: string; slug: string; isActive: boolean }>) => {
  const brand = await BrandModel.findById(brandId);
  if (!brand) throw new AppError("Brand not found", 404);

  if (payload.name !== undefined) brand.name = payload.name.trim();
  if (payload.slug !== undefined || payload.name !== undefined) {
    brand.slug = toSlug(payload.slug?.trim() || brand.name);
  }
  if (payload.isActive !== undefined) brand.isActive = payload.isActive;

  const conflict = await BrandModel.findOne({ slug: brand.slug, _id: { $ne: brandId } }).lean();
  if (conflict) throw new AppError("Brand already exists", 409);

  return brand.save();
};

export const deleteBrand = async (brandId: string) => {
  const brand = await BrandModel.findByIdAndDelete(brandId);
  if (!brand) throw new AppError("Brand not found", 404);
  return brand;
};
