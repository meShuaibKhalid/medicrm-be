import { z } from "zod";
import { objectIdSchema } from "./common";

export const createOrderSchema = z.object({
  addressId: objectIdSchema,
  customerNote: z.string().optional().default(""),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "dispatched", "delivered", "cancelled"]),
});
