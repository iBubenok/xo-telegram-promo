import express from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import type { AppConfig } from './config';
import { generatePromoCode } from './promo';
import { sendTelegramNotification } from './telegram';

const resultSchema = z.object({
  result: z.enum(['win', 'loss', 'draw']),
  chatId: z.string().regex(/^\d+$/).optional()
});

export function createApp(config: AppConfig) {
  const app = express();

  app.use(express.json());

  app.post('/api/game/result', async (req, res) => {
    const parsed = resultSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    const { result, chatId } = parsed.data;
    let promoCode: string | null = null;

    if (result === 'win') {
      promoCode = generatePromoCode();
      await sendTelegramNotification(`Победа! Промокод выдан: ${promoCode}`, config.telegram, chatId);
    } else if (result === 'loss') {
      await sendTelegramNotification('Проигрыш', config.telegram, chatId);
    } else if (config.telegram.notifyOnDraw) {
      await sendTelegramNotification('Ничья', config.telegram, chatId);
    }

    return res.json({ promoCode });
  });

  if (config.publicDir) {
    app.use(express.static(config.publicDir));

    const indexPath = path.join(config.publicDir, 'index.html');
    app.get('*', (_req, res) => {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }

      return res.status(404).send('Страница не найдена');
    });
  }

  // Короткий обработчик, чтобы не отдавать stack traces наружу.
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Некорректное тело запроса' });
      }

      console.error('Внутренняя ошибка сервера', err);
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  );

  return app;
}
