import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DriverAssignment } from "../components/DriverAssignment";
import { StatusBadge } from "../components/StatusBadge";
import { useOrderSocket } from "../hooks/useOrderSocket";
import { api, currentTokens } from "../services/api";
import { Driver, Order, OrderStatus } from "../types";

type OrderFilter = "all" | OrderStatus;

const statusTabs: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "out_for_delivery", label: "On Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Canceled" },
];

export const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const token = currentTokens.admin();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");

  const ordersQuery = useQuery({
    queryKey: ["orders", "admin", activeFilter],
    queryFn: () => api.listOrders(token as string, activeFilter === "all" ? undefined : activeFilter),
    enabled: Boolean(token),
  });

  const driversQuery = useQuery({
    queryKey: ["drivers", "admin"],
    queryFn: () => api.listDrivers(token as string),
    enabled: Boolean(token),
  });

  const assignMutation = useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      api.assignDriver(orderId, driverId, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.updateOrderStatus(orderId, status, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => api.deleteOrder(orderId, token as string),
    onSuccess: () => {
      setSelectedOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  useOrderSocket(Boolean(token), () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  });

  const orders = ordersQuery.data ?? [];
  const drivers = driversQuery.data ?? [];
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  if (!token) {
    return null;
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.5fr,0.9fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === tab.value ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              + New Order
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer transition hover:bg-slate-50 ${selectedOrderId === order.id ? "bg-blue-50/60" : ""}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.user.firstName} {order.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.address.addressLine1}, {order.address.city}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteMutation.mutate(order.id);
                        }}
                        className="rounded-lg px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        {selectedOrder ? (
          <>
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-xl text-slate-900">{selectedOrder.orderNumber}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedOrder.user.firstName} {selectedOrder.user.lastName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedOrder.address.addressLine1}, {selectedOrder.address.city}, {selectedOrder.address.state}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ orderId: selectedOrder.id, status: "out_for_delivery" })}
                  className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
                >
                  Mark Out
                </button>
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ orderId: selectedOrder.id, status: "cancelled" })}
                  className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-600"
                >
                  Cancel
                </button>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {selectedOrder.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </article>

            <DriverAssignment
              order={selectedOrder}
              drivers={drivers as Driver[]}
              onAssign={(driverId) => assignMutation.mutate({ orderId: selectedOrder.id, driverId })}
            />
          </>
        ) : (
          <article className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Select an order to assign driver and update status.
          </article>
        )}
      </aside>
    </section>
  );
};
