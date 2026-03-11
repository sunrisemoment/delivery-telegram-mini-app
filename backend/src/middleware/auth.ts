import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types/auth";

const unauthorized = (res: Response, message = "Unauthorized"): void => {
  res.status(401).json({ error: message });
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    unauthorized(res);
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & AuthUser;
    if (!decoded.sub || !decoded.role) {
      unauthorized(res);
      return;
    }

    req.user = {
      sub: decoded.sub,
      role: decoded.role,
      telegramId: decoded.telegramId,
    };
    next();
  } catch (_error) {
    unauthorized(res, "Invalid or expired token");
  }
};

export const attachAuthIfPresent = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & AuthUser;
    if (decoded.sub && decoded.role) {
      req.user = {
        sub: decoded.sub,
        role: decoded.role,
        telegramId: decoded.telegramId,
      };
    }
  } catch (_error) {
    // Ignore invalid optional token and continue as unauthenticated.
  }

  next();
};
