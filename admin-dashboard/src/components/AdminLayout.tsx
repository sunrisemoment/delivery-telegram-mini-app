import { ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authStore } from "../utils/auth";

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const menuItems: MenuItem[] = [
  {
    path: "/admin/orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M4 5h16v4H4z" />
        <path d="M4 9v10h16V9" />
        <path d="M9 13h6" />
      </svg>
    ),
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M12 2l8 4-8 4-8-4 8-4z" />
        <path d="M4 10l8 4 8-4" />
        <path d="M4 14l8 4 8-4" />
      </svg>
    ),
  },
  {
    path: "/admin/customers",
    label: "Customers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M3 21a5 5 0 0 1 10 0" />
        <path d="M13 21a5 5 0 0 1 8 0" />
      </svg>
    ),
  },
  {
    path: "/admin/drivers",
    label: "Drivers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3 13h13v5H3z" />
        <path d="M16 15h3l2 2v1h-5z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),
  },
];

const titleMap: Record<string, string> = {
  "/admin/orders": "Order List",
  "/admin/products": "Product Management",
  "/admin/customers": "Customer Management",
  "/admin/drivers": "Driver Management",
};

export const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = authStore.getAdminToken();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => titleMap[location.pathname] ?? "Admin", [location.pathname]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f7] text-slate-800">
      <div className={`fixed inset-0 z-30 bg-slate-900/40 transition md:hidden ${isMenuOpen ? "block" : "hidden"}`} onClick={() => setIsMenuOpen(false)} />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-[#f7f8fb] p-6 transition-transform md:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M5 13h14" />
              <path d="M7 9h10" />
              <path d="M3 17h18" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#1d2b53]">Salero</h1>
            <p className="text-xs text-slate-500">Restaurant Admin</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 p-4 text-white shadow-lg">
          <p className="font-display text-base">Quick Insight</p>
          <p className="mt-2 text-xs text-blue-100">Track fulfillment speed and dispatch drivers in real time.</p>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => {
              authStore.clearAdminToken();
              navigate("/");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </button>
              <h2 className="font-display text-2xl text-slate-900">{pageTitle}</h2>
            </div>

            <div className="hidden min-w-[240px] flex-1 max-w-sm items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-400">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
              <input
                className="ml-2 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">RG</span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Ricardo Gomez</p>
                <p className="text-xs text-slate-500">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
