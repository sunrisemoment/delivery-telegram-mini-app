import { OrderStatus } from "@prisma/client";

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const canTransitionOrder = (current: OrderStatus, next: OrderStatus): boolean =>
  statusTransitions[current].includes(next);

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ATL-${timestamp}${random}`;
};
