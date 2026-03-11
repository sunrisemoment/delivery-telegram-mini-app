export type AuthRole = "admin" | "customer" | "driver";

export interface AuthUser {
  sub: string;
  role: AuthRole;
  telegramId?: string;
}
