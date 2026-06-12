import closeWithGrace from 'close-with-grace';
import { ENV } from 'varlock/env';
import { buildApp } from './app.ts';
import 'varlock/auto-load';

const app = await buildApp();

closeWithGrace(async ({ signal, err }) => {
  if (err) {
    app.log.error({ err }, 'server closing with error');
  }
  else {
    app.log.info(`${signal} received, server closing`);
  }
  await app.close();
});

await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
