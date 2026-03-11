import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { authStore } from "../utils/auth";

export const DriverLoginPage = () => {
  const navigate = useNavigate();
  const [driverId, setDriverId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const { token } = await api.driverLogin(driverId, phone || undefined);
      authStore.setDriverToken(token);
      navigate("/driver/orders");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-grid bg-grid px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Driver Access</p>
        <h1 className="mt-1 font-display text-3xl text-ink-900">Delivery Runner</h1>
        <p className="mt-2 text-sm text-slate-600">Enter assigned driver credentials from admin.</p>
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={driverId}
            onChange={(event) => setDriverId(event.target.value)}
            placeholder="Driver ID (UUID)"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone (optional verification)"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-mint-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-mint-700"
          >
            Enter Driver Console
          </button>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </form>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700"
        >
          Back to Admin Login
        </button>
      </section>
    </main>
  );
};
