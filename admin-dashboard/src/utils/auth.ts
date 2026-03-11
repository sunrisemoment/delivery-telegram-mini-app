const ADMIN_TOKEN_KEY = "admin_token";
const DRIVER_TOKEN_KEY = "driver_token";

export const authStore = {
  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),

  getDriverToken: () => localStorage.getItem(DRIVER_TOKEN_KEY),
  setDriverToken: (token: string) => localStorage.setItem(DRIVER_TOKEN_KEY, token),
  clearDriverToken: () => localStorage.removeItem(DRIVER_TOKEN_KEY),
};
