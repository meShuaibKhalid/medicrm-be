import { Router } from "express";
import { addMyAddress, getMyAddresses, makeDefaultAddress, patchMyAddress, removeMyAddress } from "../controllers/userController";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { objectIdSchema } from "../validators/common";
import { addressSchema, addressUpdateSchema } from "../validators/addressValidators";

const router = Router();

router.use(asyncHandler(requireAuth));
router.get("/me/addresses", asyncHandler(getMyAddresses));
router.post("/me/addresses", validate(addressSchema), asyncHandler(addMyAddress));
router.patch("/me/addresses/:id", validate(objectIdSchema.transform((id) => ({ id })), "params"), validate(addressUpdateSchema), asyncHandler(patchMyAddress));
router.delete("/me/addresses/:id", validate(objectIdSchema.transform((id) => ({ id })), "params"), asyncHandler(removeMyAddress));
router.patch("/me/addresses/:id/default", validate(objectIdSchema.transform((id) => ({ id })), "params"), asyncHandler(makeDefaultAddress));

export default router;
