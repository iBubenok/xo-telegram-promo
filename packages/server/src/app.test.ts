import request from 'supertest';
import { createApp } from './app';
import type { AppConfig } from './config';
import * as telegram from './telegram';

const baseConfig: AppConfig = {
  port: 0,
  publicDir: undefined,
  telegram: {
    botToken: 'token',
    chatId: 'chat',
    timeoutMs: 1000,
    notifyOnDraw: false,
    gameLink: 'http://localhost:3000'
  }
};

describe('POST /api/game/result', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('возвращает промокод при победе и отправляет уведомление', async () => {
    const sendSpy = vi
      .spyOn(telegram, 'sendTelegramNotification')
      .mockResolvedValue('sent');

    const app = createApp(baseConfig);
    const response = await request(app)
      .post('/api/game/result')
      .send({ result: 'win', chatId: '123' });

    expect(response.status).toBe(200);
    expect(response.body.promoCode).toMatch(/^\d{5}$/);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.stringContaining('Победа! Промокод выдан'),
      baseConfig.telegram,
      '123'
    );
  });

  it('возвращает 400 при неверных данных', async () => {
    const app = createApp(baseConfig);
    const response = await request(app).post('/api/game/result').send({ result: 'oops' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Некорректные данные' });
  });

  it('отправляет сообщение о проигрыше без промокода', async () => {
    const sendSpy = vi
      .spyOn(telegram, 'sendTelegramNotification')
      .mockResolvedValue('sent');

    const app = createApp(baseConfig);
    const response = await request(app)
      .post('/api/game/result')
      .send({ result: 'loss', chatId: '987' });

    expect(response.status).toBe(200);
    expect(response.body.promoCode).toBeNull();
    expect(sendSpy).toHaveBeenCalledWith('Проигрыш', baseConfig.telegram, '987');
  });

  it('ничья без уведомлений не трогает Telegram', async () => {
    const sendSpy = vi
      .spyOn(telegram, 'sendTelegramNotification')
      .mockResolvedValue('sent');

    const app = createApp(baseConfig);
    const response = await request(app).post('/api/game/result').send({ result: 'draw' });

    expect(response.status).toBe(200);
    expect(response.body.promoCode).toBeNull();
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('ничья с уведомлением отправляет сообщение', async () => {
    const sendSpy = vi
      .spyOn(telegram, 'sendTelegramNotification')
      .mockResolvedValue('sent');

    const app = createApp({
      ...baseConfig,
      telegram: { ...baseConfig.telegram, notifyOnDraw: true }
    });

    const response = await request(app).post('/api/game/result').send({ result: 'draw' });

    expect(response.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledWith(
      'Ничья',
      {
        ...baseConfig.telegram,
        notifyOnDraw: true
      },
      undefined
    );
  });
});
