import { sendTelegramNotification } from './telegram';

describe('sendTelegramNotification', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalFetch) {
      global.fetch = originalFetch;
    }
  });

  it('пропускает отправку, если токен или chat id не заданы', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    const result = await sendTelegramNotification('test', {
      botToken: undefined,
      chatId: undefined,
      timeoutMs: 1000,
      notifyOnDraw: false
    });

    expect(result).toBe('skipped');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('отправляет запрос к Telegram API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => ''
    });

    // @ts-expect-error - подмена глобального fetch для теста
    global.fetch = fetchMock;

    const result = await sendTelegramNotification('Тест', {
      botToken: 'token',
      chatId: 'chat',
      timeoutMs: 1000,
      notifyOnDraw: false
    }, 'override-chat');

    expect(result).toBe('sent');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bottoken/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: 'override-chat', text: 'Тест' })
      })
    );
  });
});
