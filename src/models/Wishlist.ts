import { Schema, Types, model, type InferSchemaType } from "mongoose";

const wishlistItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const wishlistSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true },
);

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;
export const WishlistModel = model("Wishlist", wishlistSchema);
