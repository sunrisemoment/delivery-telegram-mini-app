import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";
import { jsonReplacer } from "./utils/json";

export const createApp = () => {
  const app = express();
  app.set("json replacer", jsonReplacer);
  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  app.get("/", (_req, res) => {
    res.json({
      name: "telegram-delivery-backend",
      version: "0.1.0",
      endpoints: ["/api/health", "/api/products", "/api/orders", "/api/drivers", "/api/addresses"],
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
