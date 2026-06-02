import { Schema, model, type InferSchemaType } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type BrandDocument = InferSchemaType<typeof brandSchema>;
export const BrandModel = model("Brand", brandSchema);
