import type mongoose from "mongoose";
import { CategoryModel } from "../models/Category";
import { AppError } from "../utils/errors";
import { toSlug } from "../utils/slug";

export const listCategories = async () => CategoryModel.find({ isActive: true }).sort({ level: 1, name: 1 }).lean();

export const getCategoryTree = async () => {
  const categories = await CategoryModel.find({ isActive: true }).sort({ level: 1, name: 1 }).lean();
  const map = new Map<string, Record<string, unknown> & { children: unknown[] }>();

  categories.forEach((category) => {
    map.set(String(category._id), { ...category, children: [] });
  });

  const roots: Array<Record<string, unknown> & { children: unknown[] }> = [];
  map.forEach((category) => {
    if (category.parentId) {
      map.get(String(category.parentId))?.children.push(category);
    } else {
      roots.push(category);
    }
  });

  return roots;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await CategoryModel.findOne({ slug, isActive: true }).lean();
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const createCategory = async (payload: { name: string; slug: string; parentId?: string | null; isActive?: boolean }) => {
  let parent = null;
  if (payload.parentId) {
    parent = await CategoryModel.findById(payload.parentId);
    if (!parent) throw new AppError("Parent category not found", 404);
  }

  return CategoryModel.create({
    name: payload.name,
    slug: toSlug(payload.slug),
    parentId: parent?._id ?? null,
    ancestors: parent ? [...((parent.ancestors as unknown) as mongoose.Types.ObjectId[]), parent._id] : [],
    level: parent ? Number(parent.level) + 1 : 0,
    isActive: payload.isActive ?? true,
  });
};

export const updateCategory = async (categoryId: string, payload: { name?: string; slug?: string; parentId?: string | null; isActive?: boolean }) => {
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw new AppError("Category not found", 404);

  let parent = null;
  if (payload.parentId !== undefined) {
    if (payload.parentId) {
      if (payload.parentId === categoryId) throw new AppError("Category cannot be its own parent");
      parent = await CategoryModel.findById(payload.parentId);
      if (!parent) throw new AppError("Parent category not found", 404);
      if (((parent.ancestors as unknown) as mongoose.Types.ObjectId[]).some((ancestorId) => String(ancestorId) === categoryId)) {
        throw new AppError("Invalid parent category");
      }
    }

    category.parentId = parent?._id ?? null;
    category.ancestors = (parent ? [...((parent.ancestors as unknown) as mongoose.Types.ObjectId[]), parent._id] : []) as never;
    category.level = parent ? Number(parent.level) + 1 : 0;
  }

  if (payload.name) category.name = payload.name;
  if (payload.slug) category.slug = toSlug(payload.slug);
  if (payload.isActive !== undefined) category.isActive = payload.isActive;
  await category.save();

  await syncDescendants(category._id);
  return category;
};

const syncDescendants = async (categoryId: mongoose.Types.ObjectId): Promise<void> => {
  const parent = await CategoryModel.findById(categoryId);
  const children = await CategoryModel.find({ parentId: categoryId });

  for (const child of children) {
    child.ancestors = (parent ? [...((parent.ancestors as unknown) as mongoose.Types.ObjectId[]), parent._id] : []) as never;
    child.level = parent ? Number(parent.level) + 1 : 0;
    await child.save();
    await syncDescendants(child._id);
  }
};

export const deleteCategory = async (categoryId: string) => {
  const hasChildren = await CategoryModel.exists({ parentId: categoryId });
  if (hasChildren) throw new AppError("Delete child categories first", 400);

  const category = await CategoryModel.findByIdAndDelete(categoryId);
  if (!category) throw new AppError("Category not found", 404);
};
