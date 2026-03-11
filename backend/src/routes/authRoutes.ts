import { Router } from "express";
import { adminLogin, driverLogin, me, telegramLogin } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/telegram", asyncHandler(telegramLogin));
authRouter.post("/admin/login", asyncHandler(adminLogin));
authRouter.post("/driver/login", asyncHandler(driverLogin));
authRouter.get("/me", requireAuth, asyncHandler(me));
