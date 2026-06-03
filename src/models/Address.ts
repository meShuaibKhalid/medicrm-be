import { Schema, Types, model, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    nearestLandmark: { type: String, default: "", trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type AddressDocument = InferSchemaType<typeof addressSchema>;
export const AddressModel = model("Address", addressSchema);
