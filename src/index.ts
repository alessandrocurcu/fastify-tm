import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import Fastify from 'fastify';
import { ENV } from 'varlock/env';
import usersRoutes from './routes/users.ts';
import 'varlock/auto-load';

const app = Fastify({
  logger: {
    level: ENV.LOG_LEVEL,
    transport: process.stdout.isTTY // attiva pretty solo nel terminale interattivo, in produzione (o pipe CI) rimane ndjson strutturato
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
            colorize: true,
            singleLine: true,
          },
        }
      : undefined,
  },
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(sensible);
await app.register(usersRoutes);

app.get('/health', async () => {
  return { status: 'ok' };
});

await app.listen({ port: 3000, host: 'localhost' });
