import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { jsonReplacer } from "../utils/json";

let wss: WebSocketServer | null = null;

export const initRealtimeServer = (server: Server): void => {
  wss = new WebSocketServer({ server, path: "/ws" });
};

export const broadcastEvent = (type: string, data: unknown): void => {
  if (!wss) {
    return;
  }

  const payload = JSON.stringify({ type, data }, jsonReplacer);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};
