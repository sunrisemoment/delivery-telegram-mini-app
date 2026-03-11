import TelegramBot from "node-telegram-bot-api";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

let bot: TelegramBot | null = null;

export const initTelegramBot = (): void => {
  if (!env.BOT_TOKEN) {
    return;
  }

  bot = new TelegramBot(env.BOT_TOKEN, { polling: env.BOT_POLLING ?? false });

  bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
    if (!msg.from) {
      return;
    }

    const telegramId = BigInt(msg.from.id);
    await prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
      },
      create: {
        telegramId,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
      },
    });

    await bot?.sendMessage(msg.chat.id, "Welcome to Atlanta Delivery", {
      reply_markup: {
        inline_keyboard: [[{ text: "Open Store", web_app: { url: env.MINI_APP_URL } }]],
      },
    });
  });
};

export const sendTelegramMessage = async (telegramId: bigint, text: string): Promise<void> => {
  if (!bot) {
    return;
  }

  try {
    await bot.sendMessage(Number(telegramId), text);
  } catch (error) {
    console.error("Failed to send telegram message:", error);
  }
};
