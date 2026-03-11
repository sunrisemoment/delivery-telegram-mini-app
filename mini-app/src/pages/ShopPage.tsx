import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartSummary } from "../components/CartSummary";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../services/api";
import { Product } from "../types";

export const ShopPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, removeItem, getItemQuantity, total } = useCart();
  const { webApp, user } = useTelegram();

  useEffect(() => {
    setError(null);
    api
      .listProducts()
      .then((response) => setProducts(response as Product[]))
      .catch((error: unknown) => {
        console.error(error);
        setError(error instanceof Error ? error.message : "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!webApp) {
      return;
    }

    const handleMainButtonClick = () => navigate("/checkout");

    if (total > 0) {
      webApp.MainButton.setText(`Checkout $${total.toFixed(2)}`);
      webApp.MainButton.onClick(handleMainButtonClick);
      webApp.MainButton.show();
    } else {
      webApp.MainButton.offClick(handleMainButtonClick);
      webApp.MainButton.hide();
    }

    return () => {
      webApp.MainButton.offClick(handleMainButtonClick);
    };
  }, [navigate, total, webApp]);

  return (
    <main className="min-h-screen bg-hero-mesh pb-24">
      <section className="mx-auto max-w-xl px-4 py-6">
        <header className="mb-6 rounded-3xl bg-slate-900/95 p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-100">Private Atlanta Fleet</p>
          <h1 className="font-display text-3xl">Atlanta Delivery</h1>
          <p className="mt-2 text-sm text-slate-200">
            {user?.first_name ? `Hi ${user.first_name}, pick what you need.` : "Browse and order in seconds."}
          </p>
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white/80 p-6 text-center text-slate-600">Loading inventory...</div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700">
            Unable to load inventory: {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getItemQuantity(product.id)}
                onAdd={addItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </section>
      <CartSummary />
    </main>
  );
};
