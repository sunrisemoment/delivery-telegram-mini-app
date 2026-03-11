import { OrderStatus } from "../types";

const styleMap: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-sky-100 text-sky-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-mint-100 text-mint-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styleMap[status]}`}>
    {status.replace(/_/g, " ")}
  </span>
);
