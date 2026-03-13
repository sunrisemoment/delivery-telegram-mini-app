import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniAppTopBar } from "../components/MiniAppTopBar";
import { useCart } from "../hooks/useCart";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../services/api";
import { AddressInput } from "../types";

type UiPaymentMethod = "cash" | "btc";

const paymentMethodMap: Record<UiPaymentMethod, "cod" | "bitcoin"> = {
  cash: "cod",
  btc: "bitcoin",
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, addItem, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useTelegram();
  const [address, setAddress] = useState<AddressInput>({
    addressLine1: "",
    addressLine2: "",
    city: "Atlanta",
    state: "GA",
    zipCode: "",
    isDefault: true,
  });
  const [paymentMethod, setPaymentMethod] = useState<UiPaymentMethod>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const orderItems = useMemo(
    () => items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    [items],
  );

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      setStatusMessage("Add at least one product to cart.");
      return;
    }

    if (!address.addressLine1.trim()) {
      setStatusMessage("Delivery address is required.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Authenticating your Telegram session. Please try again in a second.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await api.createOrder({
        address: {
          ...address,
          addressLine1: address.addressLine1.trim(),
          addressLine2: address.addressLine2?.trim(),
          city: address.city.trim() || "Atlanta",
          state: address.state.trim() || "GA",
          zipCode: address.zipCode?.trim(),
          isDefault: true,
        },
        items: orderItems,
        paymentMethod: paymentMethodMap[paymentMethod],
      });
      clearCart();
      navigate("/orders");
    } catch (currentError) {
      setStatusMessage(currentError instanceof Error ? currentError.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-xl space-y-4">
        <MiniAppTopBar title="Checkout" subtitle="Review your cart and confirm payment" showBack backTo="/" />

        <article className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-display text-lg text-slate-900">Delivery Address</h3>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
            placeholder="Address line 1"
            required
            value={address.addressLine1}
            onChange={(event) => setAddress((current) => ({ ...current, addressLine1: event.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
            placeholder="Address line 2"
            value={address.addressLine2}
            onChange={(event) => setAddress((current) => ({ ...current, addressLine2: event.target.value }))}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              placeholder="City"
              value={address.city}
              onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              placeholder="State"
              value={address.state}
              onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              placeholder="ZIP"
              value={address.zipCode}
              onChange={(event) => setAddress((current) => ({ ...current, zipCode: event.target.value }))}
            />
          </div>
        </article>

        <article className="rounded-[28px] bg-white p-4 shadow-sm">
          <h3 className="font-display text-lg text-slate-900">Payment</h3>
          <div className="mt-3 grid gap-2">
            <label className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-sm ${paymentMethod === "cash" ? "border-brand-600 bg-brand-50" : "border-slate-300"}`}>
              <div>
                <p className="font-semibold text-slate-900">Cash</p>
                <p className="text-xs text-slate-500">Pay on delivery</p>
              </div>
              <input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} name="paymentMethod" />
            </label>
            <label className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-sm ${paymentMethod === "btc" ? "border-brand-600 bg-brand-50" : "border-slate-300"}`}>
              <div>
                <p className="font-semibold text-slate-900">BTC</p>
                <p className="text-xs text-slate-500">Bitcoin payment</p>
              </div>
              <input type="radio" checked={paymentMethod === "btc"} onChange={() => setPaymentMethod("btc")} name="paymentMethod" />
            </label>
          </div>
        </article>

        <article className="rounded-[28px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg text-slate-900">Cart</h3>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{items.length} lines</span>
          </div>

          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.product.name}</p>
                  <p className="text-xs text-slate-500">${Number(item.product.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="min-w-5 text-center font-semibold text-slate-800">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => addItem(item.product)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-900"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="font-display text-xl text-slate-900">${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={submitOrder}
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl bg-peach-400 px-3 py-3 text-sm font-bold text-white transition hover:bg-peach-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>
        </article>

        {statusMessage ? <p className="text-center text-sm text-slate-700">{statusMessage}</p> : null}
      </section>
    </main>
  );
};
