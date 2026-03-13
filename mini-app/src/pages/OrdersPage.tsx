import { useEffect, useState } from "react";
import { MiniAppTopBar } from "../components/MiniAppTopBar";
import { OrderStatusPill } from "../components/OrderStatusPill";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../services/api";
import { CustomerOrder } from "../types";

const activeStatuses = new Set(["pending", "assigned", "out_for_delivery"]);

const formatPaymentMethod = (paymentMethod: CustomerOrder["paymentMethod"]) => {
  if (paymentMethod === "cod") {
    return "Cash";
  }
  return "BTC";
};

const OrderCard = ({ order }: { order: CustomerOrder }) => (
  <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-display text-lg text-slate-900">{order.orderNumber}</p>
        <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <OrderStatusPill status={order.orderStatus} />
    </div>

    <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
      <div className="flex items-center justify-between gap-3">
        <span>Payment</span>
        <span className="font-semibold text-slate-800">{formatPaymentMethod(order.paymentMethod)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span>Total</span>
        <span className="font-semibold text-slate-900">${Number(order.totalAmount).toFixed(2)}</span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Delivery address</p>
        <p className="mt-1 text-slate-700">
          {order.address.addressLine1}, {order.address.city}, {order.address.state}
        </p>
      </div>
    </div>

    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Items</p>
      <ul className="mt-2 space-y-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm text-slate-700">
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export const OrdersPage = () => {
  const { isAuthenticated } = useTelegram();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("miniapp_token");
    if (!token && !isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    api
      .listOrders()
      .then((response) => setOrders(response))
      .catch((currentError: unknown) => {
        console.error(currentError);
        setError(currentError instanceof Error ? currentError.message : "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const activeOrders = orders.filter((order) => activeStatuses.has(order.orderStatus));
  const historyOrders = orders.filter((order) => !activeStatuses.has(order.orderStatus));

  return (
    <main className="min-h-screen bg-hero-mesh px-4 py-5">
      <section className="mx-auto max-w-xl">
        <MiniAppTopBar title="Your Orders" subtitle="Active deliveries first, history below" />

        {loading ? (
          <div className="rounded-2xl bg-white/80 p-6 text-center text-slate-600">Loading your orders...</div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700">Unable to load orders: {error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/85 p-8 text-center text-sm text-slate-500 shadow-sm">
            No orders yet. Build your first cart from the store.
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-slate-900">Active Orders</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{activeOrders.length}</span>
              </div>
              {activeOrders.length > 0 ? (
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500 shadow-sm">No active orders right now.</div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-slate-900">Finished and Cancelled</h2>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{historyOrders.length}</span>
              </div>
              {historyOrders.length > 0 ? (
                <div className="space-y-3">
                  {historyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500 shadow-sm">No completed or cancelled orders yet.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
