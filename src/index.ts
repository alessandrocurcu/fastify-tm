import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import Fastify from 'fastify';
import { ENV } from 'varlock/env';
import usersRoutes from './routes/users.ts';
import 'varlock/auto-load';

const app = Fastify({
  logger: {
    level: ENV.LOG_LEVEL,
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
