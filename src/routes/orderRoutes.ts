import { Router } from "express";
import { getOrder, getOrders, placeOrder } from "../controllers/orderController";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { objectIdSchema } from "../validators/common";
import { createOrderSchema } from "../validators/orderValidators";

const router = Router();

router.use(asyncHandler(requireAuth));
router.post("/", validate(createOrderSchema), asyncHandler(placeOrder));
router.get("/my", asyncHandler(getOrders));
router.get("/:id", validate(objectIdSchema.transform((id) => ({ id })), "params"), asyncHandler(getOrder));

export default router;
