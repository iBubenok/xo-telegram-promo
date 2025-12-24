const fs = require('fs/promises');
const path = require('path');

async function copyClientBuild() {
  const source = path.resolve(__dirname, '..', '..', 'client', 'dist');
  const destination = path.resolve(__dirname, '..', 'dist', 'public');

  const sourceExists = await fs
    .access(source)
    .then(() => true)
    .catch(() => false);

  if (!sourceExists) {
    console.warn('Клиентская сборка не найдена. Сначала выполните npm run build --workspace client.');
    return;
  }

  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  await fs.cp(source, destination, { recursive: true });

  console.log('Клиентская сборка скопирована в dist/public');
}

copyClientBuild().catch((error) => {
  console.error('Не удалось скопировать клиентскую сборку', error);
  process.exitCode = 1;
});
