import { z } from "zod";
import { objectIdSchema } from "./common";

export const createOrderSchema = z.object({
  addressId: objectIdSchema,
  customerNote: z.string().optional().default(""),
  prescriptionUrl: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});
