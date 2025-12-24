import type { TelegramConfig } from './config';

type TelegramResult = 'skipped' | 'sent' | 'failed';

export async function sendTelegramNotification(
  message: string,
  config: TelegramConfig,
  targetChatId?: string
): Promise<TelegramResult> {
  const chatIdToUse = targetChatId ?? config.chatId;

  if (!config.botToken || !chatIdToUse) {
    console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы, уведомление пропущено');
    return 'skipped';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatIdToUse,
        text: message
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await safeReadText(response);
      console.warn(`Ошибка Telegram API: ${response.status} ${response.statusText}. ${text}`);
      return 'failed';
    }

    return 'sent';
  } catch (error) {
    console.warn('Не удалось отправить уведомление в Telegram', error);
    return 'failed';
  } finally {
    clearTimeout(timeout);
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
