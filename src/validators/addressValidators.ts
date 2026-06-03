import { z } from "zod";

export const addressSchema = z.object({
  label: z.enum(["Home", "Office", "Other"]).default("Home"),
  fullName: z.string().min(1),
  phone: z.string().min(5),
  city: z.string().min(1),
  area: z.string().min(1),
  addressLine: z.string().min(1),
  nearestLandmark: z.string().optional().default(""),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressSchema.partial();
