import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthRole } from "../types/auth";

export const signToken = (payload: { sub: string; role: AuthRole; telegramId?: string }): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
