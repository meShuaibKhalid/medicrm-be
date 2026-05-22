import { z } from "zod";
import { objectIdSchema } from "./common";

export const addCartItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});
