import { OrderStatus } from "../types";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  assigned: "bg-sky-100 text-sky-800",
  out_for_delivery: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const OrderStatusPill = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
);
