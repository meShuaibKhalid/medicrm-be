import fs from "node:fs/promises";
import path from "node:path";
import type mongoose from "mongoose";
import { CategoryModel } from "../models/Category";
import { ProductModel } from "../models/Product";
import { computeSalePrice, toBoolean, toNumber } from "./pricing";
import { toSlug } from "./slug";

const dataDir = path.resolve(__dirname, "../../../data");
const productsDir = path.join(dataDir, "products-by-categories");
const categoriesFile = path.join(dataDir, "orignal_categories.json");

type RawCategoryNode = {
  name: string;
  slug: string;
  children?: RawCategoryNode[];
};

type RawProduct = {
  ProductID?: string;
  Slug?: string;
  Title?: string;
  ProductImage?: string;
  Category?: string;
  CategoryName?: string;
  ParentCategory?: string;
  ParentCategorySlug?: string;
  ChildCategory?: string;
  Brand?: string;
  Price?: string;
  SalePrice?: string;
  SalePercent?: string;
  AvailableQty?: string;
  MaxOrder?: string;
  Description?: string;
  PrescriptionRequired?: string;
  Usedfor?: string;
  scrapedCategories?: Array<{ name?: string; slug?: string; originalSlug?: string }> | null;
};

export const loadCategoryTree = async (): Promise<RawCategoryNode[]> => {
  const file = await fs.readFile(categoriesFile, "utf8");
  return JSON.parse(file) as RawCategoryNode[];
};

export const walkCategories = async (
  nodes: RawCategoryNode[],
  parent: { _id: mongoose.Types.ObjectId; ancestors: mongoose.Types.ObjectId[]; level: number } | null = null,
): Promise<void> => {
  for (const node of nodes) {
    const category = await CategoryModel.findOneAndUpdate(
      { slug: toSlug(node.slug || node.name) },
      {
        $set: {
          name: node.name,
          slug: toSlug(node.slug || node.name),
          parentId: parent?._id ?? null,
          ancestors: parent ? [...parent.ancestors, parent._id] : [],
          level: parent ? Number(parent.level) + 1 : 0,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (node.children?.length) {
      await walkCategories(node.children, {
        _id: category._id as mongoose.Types.ObjectId,
        ancestors: (category.ancestors as unknown as mongoose.Types.ObjectId[]) ?? [],
        level: Number(category.level),
      });
    }
  }
};

export const getProductFiles = async (): Promise<string[]> => {
  const entries = await fs.readdir(productsDir);
  return entries.filter((entry) => entry.endsWith(".json")).map((entry) => path.join(productsDir, entry));
};

export const loadProductsFromFiles = async (): Promise<RawProduct[]> => {
  const files = await getProductFiles();
  const productsByKey = new Map<string, RawProduct>();

  for (const file of files) {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as { products?: RawProduct[] };
    if (Array.isArray(parsed.products)) {
      for (const product of parsed.products) {
        const normalizedSlug = toSlug(product.Slug || product.Title || product.ProductID || "");
        const key = normalizedSlug || product.ProductID?.trim() || "";

        if (!key) continue;
        productsByKey.set(key, product);
      }
    }
  }

  return Array.from(productsByKey.values());
};

export const findCategoryIdsForProduct = async (product: RawProduct) => {
  const candidates = [
    ...(product.scrapedCategories?.flatMap((entry) => [entry.slug, entry.originalSlug, entry.name]) ?? []),
    product.ChildCategory,
    product.CategoryName,
    product.ParentCategorySlug,
    product.Category,
    product.ParentCategory,
  ]
    .filter(Boolean)
    .map((value) => toSlug(String(value)));

  const seen = new Set<string>();
  const categoryIds: mongoose.Types.ObjectId[] = [];

  for (const slug of candidates) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const category = await CategoryModel.findOne({ slug }).select("_id").lean();
    if (category) categoryIds.push(category._id);
  }

  return categoryIds;
};

export const normalizeProduct = async (rawProduct: RawProduct) => {
  const price = toNumber(rawProduct.Price);
  const salePercent = toNumber(rawProduct.SalePercent);
  const rawSalePrice = toNumber(rawProduct.SalePrice, price);
  const salePrice = computeSalePrice(price, salePercent, rawSalePrice);
  const categoryIds = await findCategoryIdsForProduct(rawProduct);

  return {
    externalProductId: rawProduct.ProductID?.trim() || undefined,
    slug: toSlug(rawProduct.Slug || rawProduct.Title || rawProduct.ProductID || ""),
    title: rawProduct.Title?.trim() || "Untitled Product",
    image: rawProduct.ProductImage?.trim() || "",
    description: rawProduct.Description?.trim() || "",
    brand: rawProduct.Brand?.trim() || "",
    price,
    salePrice,
    salePercent,
    stock: toNumber(rawProduct.AvailableQty),
    maxOrder: toNumber(rawProduct.MaxOrder),
    prescriptionRequired: toBoolean(rawProduct.PrescriptionRequired),
    usedFor: rawProduct.Usedfor?.trim() || "",
    categoryIds,
    primaryCategoryId: categoryIds[0] ?? null,
    isActive: true,
  };
};

export const upsertProducts = async (products: RawProduct[]) => {
  for (const rawProduct of products) {
    const normalized = await normalizeProduct(rawProduct);
    if (!normalized.slug || normalized.price < 0) continue;

    await ProductModel.findOneAndUpdate(
      { slug: normalized.slug },
      { $set: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
};
