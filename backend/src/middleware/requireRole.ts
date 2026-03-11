import { NextFunction, Request, Response } from "express";
import { AuthRole } from "../types/auth";

export const requireRole =
  (...roles: AuthRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
