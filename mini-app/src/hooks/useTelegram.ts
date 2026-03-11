import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { getTelegramWebApp, TelegramWebAppUser } from "../utils/telegram";

const demoUser: TelegramWebAppUser = {
  id: 999000111,
  first_name: "Demo",
  last_name: "Customer",
};

export const useTelegram = () => {
  const webApp = useMemo(() => getTelegramWebApp(), []);
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const activeWebApp = getTelegramWebApp();
    activeWebApp?.ready();
    activeWebApp?.expand();
    const telegramUser = activeWebApp?.initDataUnsafe?.user ?? demoUser;
    setUser(telegramUser);

    api
      .customerLogin({
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
      })
      .then((result) => {
        localStorage.setItem("miniapp_token", result.token);
        setIsAuthenticated(true);
      })
      .catch((error: unknown) => {
        console.error("Telegram auth failed:", error);
      });
  }, []);

  return { webApp, user, isAuthenticated };
};
