import { z } from "zod";
import { objectIdSchema } from "./common";

export const addWishlistItemSchema = z.object({
  productId: objectIdSchema,
});
