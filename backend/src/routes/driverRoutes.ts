import { Router } from "express";
import { createDriver, listDrivers, updateDriver } from "../controllers/driverController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const driverRouter = Router();

driverRouter.get("/", requireAuth, requireRole("admin", "driver"), asyncHandler(listDrivers));
driverRouter.post("/", requireAuth, requireRole("admin"), asyncHandler(createDriver));
driverRouter.put("/:id", requireAuth, requireRole("admin"), asyncHandler(updateDriver));
