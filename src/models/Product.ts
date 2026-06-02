import { Schema, Types, model, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    externalProductId: { type: String, index: true, sparse: true },
    title: { type: String, required: true, trim: true, index: "text" },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    brand: { type: String, default: "", trim: true, index: true },
    brandId: { type: Types.ObjectId, ref: "Brand", default: null, index: true },
    brandSlug: { type: String, default: "", trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    salePercent: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    maxOrder: { type: Number, default: 0, min: 0 },
    prescriptionRequired: { type: Boolean, default: false },
    usedFor: { type: String, default: "", trim: true },
    categoryIds: [{ type: Types.ObjectId, ref: "Category", index: true }],
    primaryCategoryId: { type: Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const ProductModel = model("Product", productSchema);
