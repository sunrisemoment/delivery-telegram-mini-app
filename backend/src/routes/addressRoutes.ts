import { Router } from "express";
import { createAddress, listAddresses, updateAddress } from "../controllers/addressController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const addressRouter = Router();

addressRouter.use(requireAuth, requireRole("customer"));
addressRouter.get("/", asyncHandler(listAddresses));
addressRouter.post("/", asyncHandler(createAddress));
addressRouter.put("/:id", asyncHandler(updateAddress));
