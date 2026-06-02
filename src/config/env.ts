import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default("mongodb://localhost:27017/medi-crm"),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().optional().default(true),
  S3_PRODUCT_IMAGE_PREFIX: z.string().optional().default("products"),
});

export const env = envSchema.parse(process.env);
