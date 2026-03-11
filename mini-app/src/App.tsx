import { Navigate, Route, Routes } from "react-router-dom";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ShopPage } from "./pages/ShopPage";

export const App = () => (
  <Routes>
    <Route path="/" element={<ShopPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
