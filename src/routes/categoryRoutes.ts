import { Router } from "express";
import { getCategories, getCategoriesTree, getCategory, getCategoryProducts } from "../controllers/categoryController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getCategories));
router.get("/tree", asyncHandler(getCategoriesTree));
router.get("/:slug/products", asyncHandler(getCategoryProducts));
router.get("/:slug", asyncHandler(getCategory));

export default router;
