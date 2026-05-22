import { Schema, Types, model, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    nearestLandmark: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type AddressDocument = InferSchemaType<typeof addressSchema>;
export const AddressModel = model("Address", addressSchema);
