import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeliveryProofForm } from "../components/DeliveryProofForm";
import { StatusBadge } from "../components/StatusBadge";
import { useOrderSocket } from "../hooks/useOrderSocket";
import { api, currentTokens } from "../services/api";
import { Order } from "../types";
import { authStore } from "../utils/auth";

export const DriverOrdersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = currentTokens.driver();

  useEffect(() => {
    if (!token) {
      navigate("/driver/login");
    }
  }, [navigate, token]);

  const ordersQuery = useQuery({
    queryKey: ["orders", "driver"],
    queryFn: () => api.listOrders(token as string) as Promise<Order[]>,
    enabled: Boolean(token),
  });

  useOrderSocket(Boolean(token), () => queryClient.invalidateQueries({ queryKey: ["orders", "driver"] }));

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.updateOrderStatus(orderId, status, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "driver"] }),
  });

  const deliverMutation = useMutation({
    mutationFn: ({ orderId, file }: { orderId: string; file: File }) => api.deliverOrder(orderId, file, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "driver"] }),
  });

  const orders = ordersQuery.data ?? [];
  const activeOrders = useMemo(
    () => orders.filter((order) => order.orderStatus === "assigned" || order.orderStatus === "out_for_delivery"),
    [orders],
  );

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-2xl bg-ink-900 p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mint-100">Driver Console</p>
              <h1 className="mt-1 font-display text-3xl">Assigned Deliveries</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                authStore.clearDriverToken();
                navigate("/driver/login");
              }}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        {ordersQuery.isLoading ? <p className="text-sm text-slate-500">Loading driver orders...</p> : null}

        <div className="grid gap-4">
          {activeOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl text-ink-900">{order.orderNumber}</h2>
                <StatusBadge status={order.orderStatus} />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {order.address.addressLine1}, {order.address.city}, {order.address.state}
              </p>
              <p className="mt-1 text-xs text-slate-500">{order.items.length} items</p>

              <div className="mt-4 flex gap-2">
                {order.orderStatus === "assigned" ? (
                  <button
                    type="button"
                    onClick={() => statusMutation.mutate({ orderId: order.id, status: "out_for_delivery" })}
                    className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                  >
                    Start Route
                  </button>
                ) : null}
              </div>

              {order.orderStatus === "out_for_delivery" ? (
                <div className="mt-4">
                  <DeliveryProofForm
                    onSubmit={async (file) => {
                      await deliverMutation.mutateAsync({ orderId: order.id, file });
                    }}
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
