/* eslint-disable prefer-arrow-callback */
import type { FastifyPluginAsyncZod } from '@fastify/type-provider-zod';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.coerce.number().positive(),
});

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  // name: z.string(),
  created_at: z.string(),
});

const usersRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // fastify.get(
  //   '/users',
  //   { schema: { response: { 200: z.array(userSchema) } } },
  //   async function listUsers() {
  //     // return fastify.db.prepare('SELECT * FROM users').all() as z.infer<typeof userSchema>[];
  //   },
  // );

  fastify.get(
    '/users/:id',
    {
      schema: {
        params: paramsSchema,
        response: { 200: userSchema },
      },
    },
    async function getUser(_request, reply) {
      const user: z.infer<typeof userSchema> = {
        id: 2,
        email: 'Ale',
        created_at: '',
      };
      // const user2 = fastify.db
      //   .prepare('SELECT * FROM users WHERE id = ?')
      //   .get(request.params.id) as z.infer<typeof userSchema> | undefined;

      if (!user) {
        return reply.notFound(`User not found`);
      }

      return user;
    },
  );
};

export default usersRoutes;
