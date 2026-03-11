import { Router } from "express";
import multer from "multer";
import path from "path";
import { env } from "../config/env";
import {
  assignDriver,
  createOrder,
  deleteOrder,
  deliverOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.get("/", asyncHandler(listOrders));
orderRouter.get("/:id", asyncHandler(getOrderById));
orderRouter.post("/", requireRole("customer"), asyncHandler(createOrder));
orderRouter.post("/:id/assign", requireRole("admin"), asyncHandler(assignDriver));
orderRouter.put("/:id/status", requireRole("admin", "driver"), asyncHandler(updateOrderStatus));
orderRouter.post("/:id/deliver", requireRole("admin", "driver"), upload.single("photo"), asyncHandler(deliverOrder));
orderRouter.delete("/:id", requireRole("admin"), asyncHandler(deleteOrder));
