import { Router } from "express";
import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteProduct,
  adminGetOrders,
  adminDeleteUser,
  adminGetUsers,
  adminPatchCategory,
  adminPatchOrderStatus,
  adminPatchProduct,
  adminPatchUserStatus,
  adminGetProducts,
  adminGetCategories,
  adminGetBrands,
  adminGetStats,
  adminCreateBrand,
  adminPatchBrand,
  adminDeleteBrand,
} from "../controllers/adminController";
import { requireAdmin, requireAuth } from "../middlewares/auth";
import { adminProductUpload, normalizeProductMultipartBody } from "../middlewares/adminProductUpload";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryBodySchema } from "../validators/categoryValidators";
import { brandBodySchema } from "../validators/brandValidators";
import { objectIdSchema } from "../validators/common";
import { updateOrderStatusSchema } from "../validators/orderValidators";
import { productBodySchema } from "../validators/productValidators";
import { z } from "zod";

const router = Router();
const idParamSchema = z.object({ id: objectIdSchema });

router.use(asyncHandler(requireAuth), requireAdmin);
router.post(
  "/products",
  adminProductUpload.single("imageFile"),
  normalizeProductMultipartBody,
  validate(productBodySchema),
  asyncHandler(adminCreateProduct),
);
router.patch(
  "/products/:id",
  validate(idParamSchema, "params"),
  adminProductUpload.single("imageFile"),
  normalizeProductMultipartBody,
  validate(productBodySchema.partial()),
  asyncHandler(adminPatchProduct),
);
router.delete("/products/:id", validate(idParamSchema, "params"), asyncHandler(adminDeleteProduct));
router.post("/categories", validate(categoryBodySchema), asyncHandler(adminCreateCategory));
router.patch("/categories/:id", validate(idParamSchema, "params"), validate(categoryBodySchema.partial()), asyncHandler(adminPatchCategory));
router.delete("/categories/:id", validate(idParamSchema, "params"), asyncHandler(adminDeleteCategory));
router.get("/brands", asyncHandler(adminGetBrands));
router.post("/brands", validate(brandBodySchema), asyncHandler(adminCreateBrand));
router.patch("/brands/:id", validate(idParamSchema, "params"), validate(brandBodySchema.partial()), asyncHandler(adminPatchBrand));
router.delete("/brands/:id", validate(idParamSchema, "params"), asyncHandler(adminDeleteBrand));
router.get("/orders", asyncHandler(adminGetOrders));
router.patch("/orders/:id/status", validate(idParamSchema, "params"), validate(updateOrderStatusSchema), asyncHandler(adminPatchOrderStatus));
router.get("/users", asyncHandler(adminGetUsers));
router.get("/stats", asyncHandler(adminGetStats));
router.get("/products", asyncHandler(adminGetProducts));
router.get("/categories", asyncHandler(adminGetCategories));
router.patch(
  "/users/:id/status",
  validate(idParamSchema, "params"),
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(adminPatchUserStatus),
);

router.delete(
  "/users/:id",
  validate(idParamSchema, "params"),
  asyncHandler(adminDeleteUser)
);

export default router;
