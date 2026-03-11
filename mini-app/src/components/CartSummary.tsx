import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export const CartSummary = () => {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{itemCount} items</p>
          <p className="font-display text-lg text-slate-900">${total.toFixed(2)}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="rounded-full bg-peach-400 px-5 py-3 text-sm font-bold text-white transition hover:bg-peach-700"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};
