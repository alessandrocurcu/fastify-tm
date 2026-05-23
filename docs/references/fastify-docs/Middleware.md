Starting with Fastify v3.0.0, middleware is not supported out of the box and requires an external plugin such as [`@fastify/express`](https://github.com/fastify/fastify-express) or [`@fastify/middie`](https://github.com/fastify/middie).

```
await fastify.register(require('@fastify/express'))
fastify.use(require('cors')())
fastify.use(require('dns-prefetch-control')())
fastify.use(require('frameguard')())
fastify.use(require('hsts')())
fastify.use(require('ienoopen')())
fastify.use(require('x-xss-protection')())
```

[`@fastify/middie`](https://github.com/fastify/middie) can also be used, which provides support for simple Express-style middleware with improved performance:

Middleware can be encapsulated, allowing control over where it runs using `register` as explained in the [plugins guide](../fastify-guide/The-hitchhikers-guide-to-plugins.md).

Fastify middleware does not expose the `send` method or other methods specific to the Fastify [Reply](./Reply-Fastify.md#reply) instance. This is because Fastify wraps the incoming `req` and `res` Node instances using the [Request](./Request-Fastify.md#request) and [Reply](./Reply-Fastify.md#reply) objects internally, but this is done after the middleware phase. To create middleware, use the Node `req` and `res` instances. Alternatively, use the `preHandler` hook that already has the Fastify [Request](./Request-Fastify.md#request) and [Reply](./Reply-Fastify.md#reply) instances. For more information, see [Hooks](./Hooks-Fastify.md#hooks).

To run middleware under certain paths, pass the path as the first parameter to `use`.

```
const path = require('node:path')
const serveStatic = require('serve-static')

// Single path
fastify.use('/css', serveStatic(path.join(__dirname, '/assets')))

// Wildcard path
fastify.use('/css/(.*)', serveStatic(path.join(__dirname, '/assets')))

// Multiple paths
fastify.use(['/css', '/js'], serveStatic(path.join(__dirname, '/assets')))
```