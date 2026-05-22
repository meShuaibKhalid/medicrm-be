import { Router } from "express";
import { addItem, deleteItem, destroyCart, getCart, patchItem } from "../controllers/cartController";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidators";
import { objectIdSchema } from "../validators/common";

const router = Router();

router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(getCart));
router.post("/items", validate(addCartItemSchema), asyncHandler(addItem));
router.patch("/items/:productId", validate(objectIdSchema.transform((productId) => ({ productId })), "params"), validate(updateCartItemSchema), asyncHandler(patchItem));
router.delete("/items/:productId", validate(objectIdSchema.transform((productId) => ({ productId })), "params"), asyncHandler(deleteItem));
router.delete("/", asyncHandler(destroyCart));

export default router;
