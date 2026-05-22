import { Router } from "express";
import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteProduct,
  adminGetOrders,
  adminGetUsers,
  adminPatchCategory,
  adminPatchOrderStatus,
  adminPatchProduct,
  adminPatchUserStatus,
} from "../controllers/adminController";
import { requireAdmin, requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryBodySchema } from "../validators/categoryValidators";
import { objectIdSchema } from "../validators/common";
import { updateOrderStatusSchema } from "../validators/orderValidators";
import { productBodySchema } from "../validators/productValidators";
import { z } from "zod";

const router = Router();
const idParamSchema = objectIdSchema.transform((id) => ({ id }));

router.use(asyncHandler(requireAuth), requireAdmin);
router.post("/products", validate(productBodySchema), asyncHandler(adminCreateProduct));
router.patch("/products/:id", validate(idParamSchema, "params"), validate(productBodySchema.partial()), asyncHandler(adminPatchProduct));
router.delete("/products/:id", validate(idParamSchema, "params"), asyncHandler(adminDeleteProduct));
router.post("/categories", validate(categoryBodySchema), asyncHandler(adminCreateCategory));
router.patch("/categories/:id", validate(idParamSchema, "params"), validate(categoryBodySchema.partial()), asyncHandler(adminPatchCategory));
router.delete("/categories/:id", validate(idParamSchema, "params"), asyncHandler(adminDeleteCategory));
router.get("/orders", asyncHandler(adminGetOrders));
router.patch("/orders/:id/status", validate(idParamSchema, "params"), validate(updateOrderStatusSchema), asyncHandler(adminPatchOrderStatus));
router.get("/users", asyncHandler(adminGetUsers));
router.patch(
  "/users/:id/status",
  validate(idParamSchema, "params"),
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(adminPatchUserStatus),
);

export default router;
