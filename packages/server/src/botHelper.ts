import type { TelegramConfig } from './config';
import { sendTelegramNotification } from './telegram';

const POLL_TIMEOUT_SEC = 25;

export function startBotHelper(config: TelegramConfig) {
  if (!config.botToken) {
    console.warn('Bot helper не запущен: отсутствует TELEGRAM_BOT_TOKEN');
    return;
  }

  console.log('Bot helper запущен, ожидаем сообщения /start');
  let offset = 0;
  const gameLink = config.gameLink ?? 'http://localhost:3000';

  const loop = async () => {
    try {
      const updates = await fetch(
        `https://api.telegram.org/bot${config.botToken}/getUpdates?timeout=${POLL_TIMEOUT_SEC}&offset=${offset}`,
        { signal: AbortSignal.timeout((POLL_TIMEOUT_SEC + 5) * 1000) }
      );

      if (!updates.ok) {
        console.warn('Не удалось получить обновления бота', updates.status, updates.statusText);
        setTimeout(loop, 2000);
        return;
      }

      const data = (await updates.json()) as {
        ok: boolean;
        result?: {
          update_id: number;
          message?: { chat: { id: number; username?: string; first_name?: string }; text?: string };
        }[];
      };

      if (!data.ok || !data.result) {
        setTimeout(loop, 2000);
        return;
      }

      for (const update of data.result) {
        offset = Math.max(offset, update.update_id + 1);
        if (!update.message) continue;

        const chatId = update.message.chat.id.toString();
        void sendTelegramNotification(buildWelcomeMessage(gameLink, chatId), config, chatId);
      }
    } catch (error) {
      console.warn('Цикл опроса бота завершился с ошибкой', error);
      setTimeout(loop, 3000);
      return;
    }

    setImmediate(loop);
  };

  void loop();
}

function buildWelcomeMessage(gameLink: string, chatId: string) {
  const linkWithChat = `${gameLink.replace(/\/$/, '')}?chatId=${chatId}`;

  return [
    'Привет! ✨ Я слежу за твоими партиями в крестики-нолики.',
    '',
    '1) Открой игру по ссылке и сыграй против компьютера:',
    linkWithChat,
    '',
    '2) Я пришлю сюда уведомление о победе (с промокодом) или поражении.',
    '3) В игре будет видно, что уведомления настроены на этот чат.',
    '',
    'Удачи и мягких побед!'
  ].join('\n');
}
