import { Router } from "express";
import { addItem, deleteItem, getWishlist, moveToCart } from "../controllers/wishlistController";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { addWishlistItemSchema } from "../validators/wishlistValidators";
import { objectIdSchema } from "../validators/common";
import { z } from "zod";

const router = Router();
const productIdParamSchema = z.object({ productId: objectIdSchema });

router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(getWishlist));
router.post("/items", validate(addWishlistItemSchema), asyncHandler(addItem));
router.delete("/items/:productId", validate(productIdParamSchema, "params"), asyncHandler(deleteItem));
router.post("/items/:productId/move-to-cart", validate(productIdParamSchema, "params"), asyncHandler(moveToCart));

export default router;
