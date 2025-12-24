import dotenv from 'dotenv';

dotenv.config();

export interface TelegramConfig {
  botToken?: string;
  chatId?: string;
  timeoutMs: number;
  notifyOnDraw: boolean;
  gameLink?: string;
}

export interface AppConfig {
  port: number;
  publicDir?: string;
  telegram: TelegramConfig;
}

const DEFAULT_PORT = 3000;
const DEFAULT_TELEGRAM_TIMEOUT_MS = 5000;

export function loadConfig(overrides: Partial<Pick<AppConfig, 'publicDir'>> = {}): AppConfig {
  const portFromEnv = Number.parseInt(process.env.PORT ?? '', 10);
  const timeoutFromEnv = Number.parseInt(process.env.TELEGRAM_TIMEOUT_MS ?? '', 10);

  return {
    port: Number.isFinite(portFromEnv) ? portFromEnv : DEFAULT_PORT,
    publicDir: overrides.publicDir,
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
      timeoutMs: Number.isFinite(timeoutFromEnv) ? timeoutFromEnv : DEFAULT_TELEGRAM_TIMEOUT_MS,
      notifyOnDraw: (process.env.TELEGRAM_NOTIFY_ON_DRAW ?? 'false').toLowerCase() === 'true',
      gameLink: process.env.GAME_LINK
    }
  };
}
