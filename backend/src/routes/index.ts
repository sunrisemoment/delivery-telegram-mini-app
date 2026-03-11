import { Router } from "express";
import { addressRouter } from "./addressRoutes";
import { authRouter } from "./authRoutes";
import { customerRouter } from "./customerRoutes";
import { driverRouter } from "./driverRoutes";
import { orderRouter } from "./orderRoutes";
import { productRouter } from "./productRoutes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/drivers", driverRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/addresses", addressRouter);
