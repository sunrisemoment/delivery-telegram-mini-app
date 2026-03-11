import { OrderStatus, PaymentMethod, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { canTransitionOrder, generateOrderNumber } from "../utils/order";
import { broadcastEvent } from "../services/realtimeService";
import { sendTelegramMessage } from "../services/botService";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
});

const addressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().default("Atlanta"),
  state: z.string().default("GA"),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const createOrderSchema = z.object({
  addressId: z.string().uuid().optional(),
  address: addressSchema.optional(),
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

const assignDriverSchema = z.object({
  driverId: z.string().uuid(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

const deliveryMetadataSchema = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

const orderWithRelations = {
  user: true,
  driver: true,
  address: true,
  items: { include: { product: true } },
  events: { orderBy: { createdAt: "desc" as const } },
  deliveryProof: true,
};

const canReadOrder = (req: Request, order: { userId: string; driverId: string | null }): boolean => {
  if (!req.user) {
    return false;
  }

  if (req.user.role === "admin") {
    return true;
  }

  if (req.user.role === "customer") {
    return order.userId === req.user.sub;
  }

  return order.driverId === req.user.sub;
};

const recordEvent = async (
  tx: Prisma.TransactionClient,
  orderId: string,
  eventType: string,
  actorType: string,
  actorId?: string,
  metadata?: Prisma.InputJsonValue,
): Promise<void> => {
  await tx.orderEvent.create({
    data: {
      orderId,
      eventType,
      actorType,
      actorId,
      metadata,
    },
  });
};

const pushOrderUpdate = (order: unknown): void => {
  broadcastEvent("ORDER_UPDATE", order);
};

const respondOrderNotFound = (res: Response): void => {
  res.status(404).json({ error: "Order not found" });
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const statusParam = req.query.status;
  const status =
    typeof statusParam === "string" && Object.values(OrderStatus).includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;

  if (typeof statusParam === "string" && !status) {
    res.status(400).json({ error: "Invalid status filter" });
    return;
  }

  const where: Prisma.OrderWhereInput = {};
  if (status) {
    where.orderStatus = status;
  }

  if (req.user.role === "customer") {
    where.userId = req.user.sub;
  } else if (req.user.role === "driver") {
    where.driverId = req.user.sub;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderWithRelations,
  });

  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: orderWithRelations,
  });

  if (!order) {
    respondOrderNotFound(res);
    return;
  }

  if (!canReadOrder(req, order)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(order);
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  if (req.user?.role !== "customer") {
    res.status(403).json({ error: "Only customers can create orders" });
    return;
  }

  const body = createOrderSchema.parse(req.body);
  const userId = req.user.sub;

  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((item) => item.productId) }, isAvailable: true },
  });

  if (products.length !== body.items.length) {
    res.status(400).json({ error: "Some products are unavailable" });
    return;
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const totalAmount = body.items.reduce((sum, item) => {
    const product = productById.get(item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    let addressId = body.addressId;
    if (body.addressId) {
      const existingAddress = await tx.address.findUnique({ where: { id: body.addressId } });
      if (!existingAddress || existingAddress.userId !== userId) {
        throw new Error("Address not found");
      }
    } else if (body.address) {
      if (body.address.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await tx.address.create({
        data: {
          userId,
          addressLine1: body.address.addressLine1,
          addressLine2: body.address.addressLine2,
          city: body.address.city,
          state: body.address.state,
          zipCode: body.address.zipCode,
          isDefault: body.address.isDefault ?? false,
        },
      });
      addressId = address.id;
    } else {
      const defaultAddress = await tx.address.findFirst({
        where: { userId, isDefault: true },
        orderBy: { createdAt: "desc" },
      });
      if (!defaultAddress) {
        throw new Error("Address is required");
      }
      addressId = defaultAddress.id;
    }

    if (!addressId) {
      throw new Error("Address is required");
    }

    const createdOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber: generateOrderNumber(),
        totalAmount,
        paymentMethod: body.paymentMethod,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productById.get(item.productId)!.price,
          })),
        },
      },
      include: orderWithRelations,
    });

    await recordEvent(tx, createdOrder.id, "ORDER_CREATED", "customer", userId, {
      paymentMethod: body.paymentMethod,
    });

    return createdOrder;
  });

  pushOrderUpdate(order);
  res.status(201).json(order);
};

export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  const body = assignDriverSchema.parse(req.body);
  const actorId = req.user?.sub;

  const [order, driver] = await Promise.all([
    prisma.order.findUnique({ where: { id: req.params.id } }),
    prisma.driver.findUnique({ where: { id: body.driverId } }),
  ]);

  if (!order) {
    respondOrderNotFound(res);
    return;
  }

  if (!driver || !driver.isActive) {
    res.status(400).json({ error: "Driver is unavailable" });
    return;
  }

  if (order.orderStatus === "cancelled" || order.orderStatus === "delivered") {
    res.status(400).json({ error: "Cannot assign driver to completed order" });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const assignedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        driverId: driver.id,
        orderStatus: "assigned",
      },
      include: orderWithRelations,
    });

    await recordEvent(tx, assignedOrder.id, "DRIVER_ASSIGNED", "admin", actorId, { driverId: driver.id });
    return assignedOrder;
  });

  pushOrderUpdate(updated);
  res.json(updated);
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const body = updateStatusSchema.parse(req.body);
  const actor = req.user;

  if (!actor) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    respondOrderNotFound(res);
    return;
  }

  if (body.status === "delivered") {
    res.status(400).json({ error: "Use /deliver endpoint to complete delivery with photo proof" });
    return;
  }

  if (actor.role === "driver" && order.driverId !== actor.sub) {
    res.status(403).json({ error: "Cannot update this order" });
    return;
  }

  if (actor.role === "customer") {
    res.status(403).json({ error: "Customers cannot update order status" });
    return;
  }

  if (!canTransitionOrder(order.orderStatus, body.status)) {
    res.status(400).json({ error: `Invalid status transition: ${order.orderStatus} -> ${body.status}` });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const nextOrder = await tx.order.update({
      where: { id: order.id },
      data: { orderStatus: body.status },
      include: orderWithRelations,
    });

    await recordEvent(tx, nextOrder.id, "STATUS_UPDATED", actor.role, actor.sub, {
      from: order.orderStatus,
      to: body.status,
    });

    return nextOrder;
  });

  pushOrderUpdate(updated);
  res.json(updated);
};

export const deliverOrder = async (req: Request, res: Response): Promise<void> => {
  const actor = req.user;
  if (!actor) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Delivery photo is required" });
    return;
  }

  const metadata = deliveryMetadataSchema.parse(req.body);
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });

  if (!order) {
    respondOrderNotFound(res);
    return;
  }

  if (actor.role === "driver" && order.driverId !== actor.sub) {
    res.status(403).json({ error: "Cannot deliver this order" });
    return;
  }

  if (actor.role === "customer") {
    res.status(403).json({ error: "Customers cannot deliver orders" });
    return;
  }

  if (!["assigned", "out_for_delivery"].includes(order.orderStatus)) {
    res.status(400).json({ error: `Order cannot be delivered from status ${order.orderStatus}` });
    return;
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  const driverId = order.driverId ?? (actor.role === "driver" ? actor.sub : null);
  if (!driverId) {
    res.status(400).json({ error: "Order must be assigned to a driver before delivery" });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const deliveredOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        orderStatus: "delivered",
        deliveryPhoto: photoUrl,
        paymentStatus: order.paymentMethod === "cod" ? order.paymentStatus : "paid",
      },
      include: orderWithRelations,
    });

    await tx.deliveryProof.upsert({
      where: { orderId: order.id },
      update: {
        photoUrl,
        lat: metadata.lat,
        lng: metadata.lng,
        driverId,
      },
      create: {
        orderId: order.id,
        driverId,
        photoUrl,
        lat: metadata.lat,
        lng: metadata.lng,
      },
    });

    await recordEvent(tx, deliveredOrder.id, "ORDER_DELIVERED", actor.role, actor.sub, {
      photoUrl,
    });

    return deliveredOrder;
  });

  if (order.user?.telegramId) {
    await sendTelegramMessage(order.user.telegramId, `Order ${order.orderNumber} has been delivered.`);
  }

  pushOrderUpdate(updated);
  res.json(updated);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    respondOrderNotFound(res);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.delete({ where: { id: order.id } });
  });

  broadcastEvent("ORDER_DELETED", { id: order.id });
  res.status(204).send();
};
