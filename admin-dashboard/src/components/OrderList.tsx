import { Order } from "../types";
import { StatusBadge } from "./StatusBadge";

interface OrderListProps {
  orders: Order[];
  selectedOrderId?: string;
  onSelect: (order: Order) => void;
}

export const OrderList = ({ orders, selectedOrderId, onSelect }: OrderListProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Order</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Customer</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Driver</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelect(order)}
              className={`cursor-pointer transition hover:bg-slate-50 ${
                order.id === selectedOrderId ? "bg-mint-100/50" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
              <td className="px-4 py-3 text-slate-700">
                {order.user.firstName} {order.user.lastName}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.orderStatus} />
              </td>
              <td className="px-4 py-3 text-slate-700">{order.driver?.name || "Unassigned"}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">${Number(order.totalAmount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
