import { Router } from "express";
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { addressSchema, addressUpdateSchema } from "../validators/addressValidators";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(asyncHandler(requireAuth));

router.post("/", validate(addressSchema), asyncHandler(createAddress));
router.get("/", asyncHandler(getAddresses));
router.put("/:id", validate(addressUpdateSchema), asyncHandler(updateAddress));
router.delete("/:id", asyncHandler(deleteAddress));
router.put("/:id/default", asyncHandler(setDefaultAddress));

export default router;
