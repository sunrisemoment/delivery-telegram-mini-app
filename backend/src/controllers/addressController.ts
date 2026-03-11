import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const addressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().default("Atlanta"),
  state: z.string().default("GA"),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const addressUpdateSchema = addressSchema.partial();

const requireCustomer = (req: Request, res: Response): string | null => {
  if (req.user?.role !== "customer") {
    res.status(403).json({ error: "Only customers can manage addresses" });
    return null;
  }
  return req.user.sub;
};

export const listAddresses = async (req: Request, res: Response): Promise<void> => {
  const userId = requireCustomer(req, res);
  if (!userId) {
    return;
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  res.json(addresses);
};

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = requireCustomer(req, res);
  if (!userId) {
    return;
  }

  const body = addressSchema.parse(req.body);

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      isDefault: body.isDefault ?? false,
    },
  });

  res.status(201).json(address);
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  const userId = requireCustomer(req, res);
  if (!userId) {
    return;
  }

  const body = addressUpdateSchema.parse(req.body);
  const addressId = req.params.id;

  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: "Address not found" });
    return;
  }

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: body,
  });

  res.json(updated);
};
