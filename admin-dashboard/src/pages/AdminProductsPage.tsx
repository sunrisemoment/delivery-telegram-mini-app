import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, currentTokens } from "../services/api";
import { Product } from "../types";

export const AdminProductsPage = () => {
  const token = currentTokens.admin();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const productsQuery = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => api.listProducts(token as string),
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createProduct(
        {
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
          imageUrl: form.imageUrl || undefined,
          isAvailable: true,
        },
        token as string,
      ),
    onSuccess: () => {
      setForm({ name: "", description: "", price: "", imageUrl: "" });
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => api.deleteProduct(productId, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", "admin"] }),
  });

  if (!token) {
    return null;
  }

  const products = productsQuery.data ?? [];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.price) {
      return;
    }
    createMutation.mutate();
  };

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-xl text-slate-900">Add Product</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Product name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 md:w-fit"
          >
            Add Product
          </button>
        </form>
      </article>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product: Product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 text-slate-700">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.description || "No description"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(product.id)}
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
      </article>
    </section>
  );
};
