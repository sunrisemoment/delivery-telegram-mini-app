const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const getAuthToken = () => localStorage.getItem("miniapp_token");

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Request failed");
  }
  return response.json() as Promise<T>;
};

export const api = {
  async customerLogin(payload: {
    telegramId: string | number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseResponse<{ token: string }>(response);
  },

  async listProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    return parseResponse(response);
  },

  async listAddresses() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseResponse(response);
  },

  async createOrder(payload: unknown) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
};
