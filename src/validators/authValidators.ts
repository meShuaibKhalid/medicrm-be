import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});
