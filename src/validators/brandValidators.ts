import { z } from "zod";

export const brandBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});
