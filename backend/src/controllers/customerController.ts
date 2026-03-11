import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const listCustomers = async (_req: Request, res: Response): Promise<void> => {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true, addresses: true },
      },
      orders: {
        select: {
          totalAmount: true,
        },
      },
    },
  });

  const mapped = customers.map((customer) => {
    const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return {
      id: customer.id,
      telegramId: customer.telegramId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      createdAt: customer.createdAt,
      ordersCount: customer._count.orders,
      addressesCount: customer._count.addresses,
      totalSpent,
    };
  });

  res.json(mapped);
};
