import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
});

const productUpdateSchema = productSchema.partial();

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const includeUnavailable = req.query.includeUnavailable === "true" && req.user?.role === "admin";

  const products = await prisma.product.findMany({
    where: includeUnavailable ? undefined : { isAvailable: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const body = productSchema.parse(req.body);
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      isAvailable: body.isAvailable ?? true,
    },
  });

  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const body = productUpdateSchema.parse(req.body);

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: body,
  });

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
