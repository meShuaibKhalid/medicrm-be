import { Schema, Types, model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    parentId: { type: Types.ObjectId, ref: "Category", default: null },
    ancestors: [{ type: Types.ObjectId, ref: "Category" }],
    level: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;
export const CategoryModel = model("Category", categorySchema);
