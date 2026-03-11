import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: "Not Found" });
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: error.issues });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  if (error instanceof Error) {
    if (error.message === "Address not found" || error.message === "Address is required") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};
