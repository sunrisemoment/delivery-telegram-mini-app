import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, currentTokens } from "../services/api";
import { Driver } from "../types";

export const AdminDriversPage = () => {
  const token = currentTokens.admin();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "" });

  const driversQuery = useQuery({
    queryKey: ["drivers", "admin"],
    queryFn: () => api.listDrivers(token as string),
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: () => api.createDriver({ name: form.name, phone: form.phone }, token as string),
    onSuccess: () => {
      setForm({ name: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["drivers", "admin"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ driverId, payload }: { driverId: string; payload: Partial<Driver> }) =>
      api.updateDriver(driverId, payload, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers", "admin"] }),
  });

  if (!token) {
    return null;
  }

  const drivers = driversQuery.data ?? [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone) {
      return;
    }
    createMutation.mutate();
  };

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-xl text-slate-900">Add Driver</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,1fr,auto]" onSubmit={onSubmit}>
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Driver name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add Driver
          </button>
        </form>
      </article>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Driver ID</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver: Driver) => (
                <tr key={driver.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{driver.name}</td>
                  <td className="px-4 py-3 text-slate-600">{driver.phone}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{driver.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        driver.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {driver.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateMutation.mutate({
                          driverId: driver.id,
                          payload: { isActive: !driver.isActive },
                        })
                      }
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      {driver.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};
