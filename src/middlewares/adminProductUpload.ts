import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/errors";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const adminProductUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files are allowed", 400));
      return;
    }

    cb(null, true);
  },
});

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
};

const normalizeOptionalField = (value: unknown): unknown => {
  if (value === "") return undefined;
  return value;
};

export const normalizeProductMultipartBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.is("multipart/form-data")) {
    next();
    return;
  }

  const body = { ...req.body } as Record<string, unknown>;

  if (typeof body.categoryIds === "string") {
    try {
      body.categoryIds = JSON.parse(body.categoryIds);
    } catch {
      body.categoryIds = [body.categoryIds];
    }
  }

  body.primaryCategoryId = normalizeOptionalField(body.primaryCategoryId);
  body.externalProductId = normalizeOptionalField(body.externalProductId);
  body.description = normalizeOptionalField(body.description);
  body.image = normalizeOptionalField(body.image);
  body.brand = normalizeOptionalField(body.brand);
  body.brandId = normalizeOptionalField(body.brandId);
  body.brandSlug = normalizeOptionalField(body.brandSlug);
  body.salePrice = normalizeOptionalField(body.salePrice);
  body.salePercent = normalizeOptionalField(body.salePercent);
  body.stock = normalizeOptionalField(body.stock);
  body.maxOrder = normalizeOptionalField(body.maxOrder);
  body.usedFor = normalizeOptionalField(body.usedFor);

  const prescriptionRequired = normalizeBoolean(body.prescriptionRequired);
  if (prescriptionRequired !== undefined) body.prescriptionRequired = prescriptionRequired;

  const isActive = normalizeBoolean(body.isActive);
  if (isActive !== undefined) body.isActive = isActive;

  req.body = body;
  next();
};
