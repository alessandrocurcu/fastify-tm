import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import Fastify from 'fastify';
import usersRoutes from './routes/users.ts';

const app = Fastify({
  logger: {
    level: 'debug',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          remoteAddress: request.ip,
          remotePort: request.socket.remotePort,
        };
      },
    },
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
