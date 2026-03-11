import { useEffect } from "react";
import { api } from "../services/api";

export const useOrderSocket = (enabled: boolean, onEvent: () => void) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = new WebSocket(api.wsUrl);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "ORDER_UPDATE") {
          onEvent();
        }
      } catch (error) {
        console.error("Socket parse error", error);
      }
    };

    return () => socket.close();
  }, [enabled, onEvent]);
};
