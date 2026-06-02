import { z } from "zod";
import { objectIdSchema, paginationSchema } from "./common";

export const productBodySchema = z.object({
  externalProductId: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  brandId: z.string().optional().nullable(),
  brandSlug: z.string().optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).optional(),
  salePercent: z.coerce.number().min(0).optional().default(0),
  stock: z.coerce.number().min(0),
  maxOrder: z.coerce.number().min(0).optional().default(0),
  prescriptionRequired: z.boolean().optional().default(false),
  usedFor: z.string().optional().default(""),
  categoryIds: z.array(objectIdSchema).default([]),
  primaryCategoryId: objectIdSchema.optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const productQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  categoryId: objectIdSchema.optional(),
  brandSlug: z.string().optional(),
  brandId: objectIdSchema.optional(),
  includeDescendants: z.coerce.boolean().optional().default(false),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  prescriptionRequired: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "latest", "title_asc"]).optional().default("latest"),
});
