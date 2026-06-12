import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
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
  requestIdHeader: 'Rndr-Id',
  trustProxy: true,
});

await app.register(rateLimit, {
  max: ENV.RATE_LIMIT_MAX,
  timeWindow: '1 minute',
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(helmet, {
  contentSecurityPolicy: false,
});
await app.register(sensible);

app.addHook('onRequest', async (request) => {
  const cfRay = request.headers['cf-ray'];
  if (cfRay) {
    request.log = request.log.child({ cfRay });
  }
});

app.setNotFoundHandler(
  { preHandler: app.rateLimit() },
  (_request, reply) => reply.notFound(),
);
await app.register(usersRoutes);

app.get('/health', async () => {
  return { status: 'ok' };
});

await app.listen({ port: 3000, host: '0.0.0.0' });
