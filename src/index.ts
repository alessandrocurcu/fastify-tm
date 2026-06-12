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

try {
  await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
}
catch (err) {
  app.log.error(err);
  process.exit(1);
  // Se listen() fallisce (porta occupata, permessi insufficienti, qualsiasi errore di avvio) ora il processo logga l'errore via Pino e termina con exit code 1 — segnale esplicito a Render che il deploy è fallito.
}
