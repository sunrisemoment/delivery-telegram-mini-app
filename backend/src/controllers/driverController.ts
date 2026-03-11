import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const driverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  telegramId: z.coerce.bigint().optional(),
  isActive: z.boolean().optional(),
});

const driverUpdateSchema = driverSchema.partial();

export const listDrivers = async (req: Request, res: Response): Promise<void> => {
  const includeInactive = req.query.includeInactive === "true" && req.user?.role === "admin";
  const drivers = await prisma.driver.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(drivers);
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  const body = driverSchema.parse(req.body);

  const driver = await prisma.driver.create({
    data: {
      name: body.name,
      phone: body.phone,
      telegramId: body.telegramId,
      isActive: body.isActive ?? true,
    },
  });

  res.status(201).json(driver);
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  const body = driverUpdateSchema.parse(req.body);

  const driver = await prisma.driver.update({
    where: { id: req.params.id },
    data: body,
  });

  res.json(driver);
};
