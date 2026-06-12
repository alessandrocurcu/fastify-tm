import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import Fastify from 'fastify';
import { ENV } from 'varlock/env';
import usersRoutes from './routes/users.ts';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: ENV.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.secret', '*.token'],
      transport: process.stdout.isTTY
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
    bodyLimit: 1_048_576, // 1 MiB — default, ma meglio esplicitarlo
    // Render/Cloudflare: keepAlive del proxy arriva a 900s, Node default è 5s → 502 intermittenti
    keepAliveTimeout: 120_000,
    http: { headersTimeout: 121_000 },
    requestIdHeader: 'Rndr-Id',
    trustProxy: true,
  });

  await app.register(cors, {
    origin: ENV.CORS_ORIGIN?.split(',') ?? false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    logLevel: 'silent',
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

  app.get('/health', { config: { rateLimit: false } }, async () => {
    return { status: 'ok' };
  });

  return app;
}
