import { z } from "zod";
import { objectIdSchema } from "./common";

export const categoryBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: objectIdSchema.nullable().optional(),
  isActive: z.boolean().optional().default(true),
});
