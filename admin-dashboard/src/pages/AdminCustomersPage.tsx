import { useQuery } from "@tanstack/react-query";
import { api, currentTokens } from "../services/api";
import { CustomerSummary } from "../types";

export const AdminCustomersPage = () => {
  const token = currentTokens.admin();

  const customersQuery = useQuery({
    queryKey: ["customers", "admin"],
    queryFn: () => api.listCustomers(token as string),
    enabled: Boolean(token),
  });

  if (!token) {
    return null;
  }

  const customers = customersQuery.data ?? [];

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-xl text-slate-900">Customers</h3>
        <p className="mt-1 text-sm text-slate-500">Monitor customer accounts and order activity.</p>
      </article>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Telegram ID</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer: CustomerSummary) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {customer.firstName || "Unknown"} {customer.lastName || ""}
                    </p>
                    <p className="text-xs text-slate-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.telegramId}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.phoneNumber || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{customer.ordersCount}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">${customer.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};
