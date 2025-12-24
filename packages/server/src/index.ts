import path from 'path';
import { createApp } from './app';
import { loadConfig } from './config';
import { startBotHelper } from './botHelper';

const config = loadConfig({ publicDir: path.join(__dirname, 'public') });
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
});

startBotHelper(config.telegram);
