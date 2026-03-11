import { Router } from "express";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../controllers/productController";
import { asyncHandler } from "../middleware/asyncHandler";
import { attachAuthIfPresent, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const productRouter = Router();

productRouter.get("/", attachAuthIfPresent, asyncHandler(listProducts));
productRouter.post("/", requireAuth, requireRole("admin"), asyncHandler(createProduct));
productRouter.put("/:id", requireAuth, requireRole("admin"), asyncHandler(updateProduct));
productRouter.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteProduct));
