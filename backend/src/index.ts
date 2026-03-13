import { createServer } from "http";
import fs from "fs";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { initTelegramBot } from "./services/botService";
import { initRealtimeServer } from "./services/realtimeService";

const bootstrap = async (): Promise<void> => {
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }

  await prisma.$connect();

  const app = createApp();
  const server = createServer(app);
  initRealtimeServer(server);
  initTelegramBot();

  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
};

bootstrap().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
