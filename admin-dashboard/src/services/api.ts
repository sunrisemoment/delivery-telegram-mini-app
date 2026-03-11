import { CustomerSummary, Driver, Order, OrderStatus, Product } from "../types";
import { authStore } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:3000/api";

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json() as Promise<T>;
};

const headers = (token: string | null, contentType = true) => ({
  ...(contentType ? { "Content-Type": "application/json" } : {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const getWsUrl = () => {
  const url = new URL(API_BASE_URL);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws`;
};

export const api = {
  wsUrl: getWsUrl(),

  async adminLogin(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: "POST",
      headers: headers(null),
      body: JSON.stringify({ username, password }),
    });
    return parseResponse<{ token: string }>(response);
  },

  async driverLogin(driverId: string, phone?: string) {
    const response = await fetch(`${API_BASE_URL}/auth/driver/login`, {
      method: "POST",
      headers: headers(null),
      body: JSON.stringify({ driverId, phone }),
    });
    return parseResponse<{ token: string }>(response);
  },

  async listOrders(token: string, status?: OrderStatus) {
    const query = status ? `?status=${status}` : "";
    const response = await fetch(`${API_BASE_URL}/orders${query}`, {
      headers: headers(token, false),
    });
    return parseResponse<Order[]>(response);
  },

  async deleteOrder(orderId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: headers(token, false),
    });

    if (response.status === 204) {
      return;
    }

    await parseResponse(response);
  },

  async listDrivers(token: string) {
    const response = await fetch(`${API_BASE_URL}/drivers?includeInactive=true`, {
      headers: headers(token, false),
    });
    return parseResponse<Driver[]>(response);
  },

  async createDriver(payload: { name: string; phone: string }, token: string) {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return parseResponse<Driver>(response);
  },

  async updateDriver(driverId: string, payload: Partial<Driver>, token: string) {
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return parseResponse<Driver>(response);
  },

  async listProducts(token: string) {
    const response = await fetch(`${API_BASE_URL}/products?includeUnavailable=true`, {
      headers: headers(token, false),
    });
    return parseResponse<Product[]>(response);
  },

  async createProduct(
    payload: { name: string; description?: string; price: number; imageUrl?: string; isAvailable?: boolean },
    token: string,
  ) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return parseResponse<Product>(response);
  },

  async deleteProduct(productId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
      headers: headers(token, false),
    });

    if (response.status === 204) {
      return;
    }

    await parseResponse(response);
  },

  async listCustomers(token: string) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: headers(token, false),
    });
    return parseResponse<CustomerSummary[]>(response);
  },

  async assignDriver(orderId: string, driverId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ driverId }),
    });
    return parseResponse<Order>(response);
  },

  async updateOrderStatus(orderId: string, status: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({ status }),
    });
    return parseResponse<Order>(response);
  },

  async deliverOrder(orderId: string, file: File, token: string, lat?: number, lng?: number) {
    const formData = new FormData();
    formData.append("photo", file);
    if (lat !== undefined) {
      formData.append("lat", String(lat));
    }
    if (lng !== undefined) {
      formData.append("lng", String(lng));
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/deliver`, {
      method: "POST",
      headers: headers(token, false),
      body: formData,
    });
    return parseResponse<Order>(response);
  },
};

export const currentTokens = {
  admin: () => authStore.getAdminToken(),
  driver: () => authStore.getDriverToken(),
};
