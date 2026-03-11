import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AdminCustomersPage } from "./pages/AdminCustomersPage";
import { AdminDriversPage } from "./pages/AdminDriversPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { DriverLoginPage } from "./pages/DriverLoginPage";
import { DriverOrdersPage } from "./pages/DriverOrdersPage";

export const App = () => (
  <Routes>
    <Route path="/" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="customers" element={<AdminCustomersPage />} />
      <Route path="drivers" element={<AdminDriversPage />} />
    </Route>
    <Route path="/driver/login" element={<DriverLoginPage />} />
    <Route path="/driver/orders" element={<DriverOrdersPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
