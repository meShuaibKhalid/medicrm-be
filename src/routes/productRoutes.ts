import { Router } from "express";
import { getProduct, getProducts } from "../controllers/productController";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { productQuerySchema } from "../validators/productValidators";

const router = Router();

router.get("/", validate(productQuerySchema, "query"), asyncHandler(getProducts));
router.get("/:slug", asyncHandler(getProduct));

export default router;
