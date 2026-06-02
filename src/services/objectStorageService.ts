import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { toSlug } from "../utils/slug";

const createS3Client = () =>
  new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials:
      env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

const ensureStorageConfig = () => {
  if (!env.S3_BUCKET || !env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new AppError("S3 storage is not configured", 500);
  }
};

const buildPublicUrl = (key: string) => {
  if (env.S3_PUBLIC_BASE_URL) {
    return `${env.S3_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;
  }

  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT.replace(/\/+$/, "")}/${env.S3_BUCKET}/${key}`;
  }

  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
};

export const uploadProductImage = async (file: Express.Multer.File, productSlug?: string) => {
  ensureStorageConfig();

  const compressedBuffer = await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const safeSlug = toSlug(productSlug || file.originalname.replace(/\.[^.]+$/, "")) || "product";
  const key = `${env.S3_PRODUCT_IMAGE_PREFIX}/${safeSlug}-${randomUUID()}.webp`;

  await createS3Client().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: compressedBuffer,
      ContentType: "image/webp",
    }),
  );

  return buildPublicUrl(key);
};
