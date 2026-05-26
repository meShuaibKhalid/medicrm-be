import { Schema, Types, model, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const addressSnapshotSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    nearestLandmark: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const userSnapshotSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    user: { type: userSnapshotSchema, required: true },
    addressId: { type: Types.ObjectId, ref: "Address", required: true },
    address: { type: addressSnapshotSchema, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash_on_delivery"], default: "cash_on_delivery" },
    status: {
      type: String,
      enum: ["Pending", "Done", "Cancelled"],
      default: "Pending",
      index: true,
    },
    prescriptionUrl: { type: String, default: "" },
    customerNote: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel = model("Order", orderSchema);
