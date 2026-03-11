import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { signToken } from "../services/authService";

const telegramAuthSchema = z.object({
  telegramId: z.coerce.bigint(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const driverLoginSchema = z.object({
  driverId: z.string().uuid(),
  phone: z.string().min(5).optional(),
});

export const telegramLogin = async (req: Request, res: Response): Promise<void> => {
  const body = telegramAuthSchema.parse(req.body);

  const user = await prisma.user.upsert({
    where: { telegramId: body.telegramId },
    update: {
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
    },
    create: {
      telegramId: body.telegramId,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
    },
  });

  const token = signToken({
    sub: user.id,
    role: "customer",
    telegramId: user.telegramId.toString(),
  });

  res.json({
    token,
    user: {
      id: user.id,
      telegramId: user.telegramId.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    },
  });
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const body = adminLoginSchema.parse(req.body);

  if (body.username !== env.ADMIN_USERNAME || body.password !== env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  const token = signToken({ sub: "admin", role: "admin" });
  res.json({ token });
};

export const driverLogin = async (req: Request, res: Response): Promise<void> => {
  const body = driverLoginSchema.parse(req.body);

  const driver = await prisma.driver.findUnique({ where: { id: body.driverId } });
  if (!driver || !driver.isActive) {
    res.status(401).json({ error: "Driver not found or inactive" });
    return;
  }

  if (body.phone && driver.phone !== body.phone) {
    res.status(401).json({ error: "Invalid driver credentials" });
    return;
  }

  const token = signToken({ sub: driver.id, role: "driver" });
  res.json({ token, driver });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role === "customer") {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    res.json({ role: req.user.role, profile: user });
    return;
  }

  if (req.user.role === "driver") {
    const driver = await prisma.driver.findUnique({ where: { id: req.user.sub } });
    res.json({ role: req.user.role, profile: driver });
    return;
  }

  res.json({ role: "admin", profile: { id: "admin", username: env.ADMIN_USERNAME } });
};
