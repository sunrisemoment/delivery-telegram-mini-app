import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { authStore } from "../utils/auth";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123456");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const { token } = await api.adminLogin(username, password);
      authStore.setAdminToken(token);
      navigate("/admin/orders");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-grid bg-grid px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Access</p>
        <h1 className="mt-1 font-display text-3xl text-ink-900">Dispatch Console</h1>
        <p className="mt-2 text-sm text-slate-600">Manage incoming Telegram delivery orders.</p>
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-ink-900 px-3 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Sign In
          </button>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </form>
        <button
          type="button"
          onClick={() => navigate("/driver/login")}
          className="mt-4 text-xs font-semibold uppercase tracking-wide text-mint-700 transition hover:text-mint-500"
        >
          Switch to Driver View
        </button>
      </section>
    </main>
  );
};
