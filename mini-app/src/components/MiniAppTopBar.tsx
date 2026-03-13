import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

interface MiniAppTopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export const MiniAppTopBar = ({ title, subtitle, showBack = false, backTo = "/" }: MiniAppTopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isOrdersPage = location.pathname === "/orders";
  const isCartPage = location.pathname === "/checkout";

  return (
    <header className="sticky top-0 z-20 mb-5 rounded-[30px] border border-white/80 bg-white/85 p-3 shadow-lg shadow-slate-200/70 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-peach-400 text-white shadow-lg shadow-brand-600/25"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M5 13h14" />
                <path d="M7 9h10" />
                <path d="M3 17h18" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-slate-900">{title}</p>
            {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              isOrdersPage ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className={`relative rounded-full px-3 py-2 text-xs font-semibold transition ${
              isCartPage ? "bg-peach-400 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Cart
            {itemCount > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
};
