import { Router } from "express";
import { listCustomers } from "../controllers/customerController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const customerRouter = Router();

customerRouter.get("/", requireAuth, requireRole("admin"), asyncHandler(listCustomers));
