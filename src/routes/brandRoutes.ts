import { Router } from "express";
import { getBrand, getBrandProducts, getBrands } from "../controllers/brandController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getBrands));
router.get("/:slug/products", asyncHandler(getBrandProducts));
router.get("/:slug", asyncHandler(getBrand));

export default router;
